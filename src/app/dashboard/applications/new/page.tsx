"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useHireFlowStore } from '@/lib/store';
import { useAuth } from '@/components/auth-context';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function NewApplicationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftIdParam = searchParams.get('draftId');
  const { addApplication, updateApplication, saveDraft, deleteDraft, draftCandidates, isDraftsInitialized } = useHireFlowStore();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [draftId, setDraftId] = useState<string | null>(draftIdParam || null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    candidateName: '',
    dob: '',
    gender: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    whatsappSameAsPhone: false,
    
    position: '',
    experience: '',
    currentCTC: '',
    expectedCTC: '',
    noticePeriodType: '',
    noticePeriodValue: '',
    noticePeriodUnit: '',
    currentEmployer: '',
    source: '',
    sourceDetails: '',
    
    qualification: '',
    specialization: '',
    college: '',
    
    languagesKnown: '',
    currentLocation: '',
    skills: '',
    notes: '',
  });

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    resume: null,
    aadhar: null,
    passportPhoto: null,
    panCard: null,
    experienceCert: null,
    educationCert: null,
    otherDocs: null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formDataRef = useRef(formData);
  useEffect(() => { formDataRef.current = formData; }, [formData]);

  // Load Draft Logic
  useEffect(() => {
    if (draftIdParam && isDraftsInitialized) {
      const draft = draftCandidates.find(d => d.draftId === draftIdParam);
      if (draft) {
        const loadedData = { ...formData, ...draft };
        if (Array.isArray(loadedData.skills)) {
          loadedData.skills = loadedData.skills.join(', ');
        }
        setFormData(loadedData as any);
        setLastSaved(draft.lastSaved || null);
      }
    } else if (isDraftsInitialized && !draftIdParam && user) {
      const existingDraft = draftCandidates.find(d => d.createdBy === user.id);
      if (existingDraft) {
        toast({
          title: "Draft Found",
          description: `You have an unsaved draft from ${new Date(existingDraft.lastSaved).toLocaleTimeString()}.`,
          action: (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => router.push(`/dashboard/applications/new?draftId=${existingDraft.draftId}`)}>Resume</Button>
              <Button size="sm" variant="destructive" onClick={() => deleteDraft(existingDraft.draftId)}>Discard</Button>
            </div>
          )
        });
      }
    }
  }, [isDraftsInitialized, draftIdParam, user]);

  const handleSaveDraft = async (data = formDataRef.current, isAuto = false) => {
    if (!user || (!data.candidateName && !data.email)) return;
    try {
      const currentDraftId = draftId || `draft-${Date.now()}`;
      if (!draftId) setDraftId(currentDraftId);
      
      const unit = ['Custom Months'].includes(data.noticePeriodType) ? 'Months' : 'Days';
      
      const draft = {
        ...data,
        skills: typeof data.skills === 'string' ? data.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '') : (data.skills || []),
        noticePeriodValue: data.noticePeriodValue ? parseInt(data.noticePeriodValue) : undefined,
        noticePeriodUnit: unit as any,
        draftId: currentDraftId,
        createdBy: user.id,
        lastSaved: new Date().toISOString()
      };
      
      await saveDraft(draft);
      setLastSaved(draft.lastSaved);
      
      if (!isAuto) {
         toast({ title: "Draft Saved", description: "Your candidate profile has been saved as a draft." });
      }
    } catch (e) {
      console.error("Draft save error: ", e);
    }
  };

  // Auto save loop
  useEffect(() => {
    const timer = setInterval(() => {
      handleSaveDraft(formDataRef.current, true);
    }, 30000);
    return () => clearInterval(timer);
  }, [draftId, user]);

  const handleNavTab = (newTab: string) => {
    handleSaveDraft(formDataRef.current, true);
    setActiveTab(newTab);
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      whatsappSameAsPhone: checked,
      whatsappNumber: checked ? prev.phone : prev.whatsappNumber
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.candidateName || !formData.email || !formData.position) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Candidate FIRST to get the Firestore ID
      const unit = ['Custom Months'].includes(formData.noticePeriodType) ? 'Months' : 'Days';
      
      const newAppId = await addApplication({
        ...formData,
        noticePeriodValue: formData.noticePeriodValue ? parseInt(formData.noticePeriodValue) : undefined,
        noticePeriodUnit: unit as any,
        skills: typeof formData.skills === 'string' ? formData.skills.split(',').map(s => s.trim()).filter(s => s !== '') : (formData.skills || []),
        resumeUrl: '',
      });

      // Delete the draft if we successfully created the candidate
      if (draftId) {
        await deleteDraft(draftId);
      }

      // 2. Try to handle file uploads using the Firestore ID
      let hasUploadErrors = false;
      const docs: any = {};
      
      try {
        const uploadPromises = Object.entries(files).map(async ([key, file]) => {
          if (file) {
            // Upload to candidates/{newAppId}/
            const url = await uploadFile(file, `candidates/${newAppId}/${key}_${file.name}`);
            docs[`${key}Url`] = url;
          }
        });
        await Promise.all(uploadPromises);

        // 3. Update Candidate with file URLs if successful
        if (Object.keys(docs).length > 0) {
          await updateApplication(newAppId, { 
            documents: docs,
            resumeUrl: docs.resumeUrl || '',
          });
        }
      } catch (uploadError) {
        console.error("File upload failed (possibly CORS):", uploadError);
        hasUploadErrors = true;
      }

      if (hasUploadErrors) {
        toast({ 
          title: "Candidate Saved (Partial)", 
          description: "Data was saved, but file uploads failed (CORS policy or network error).", 
          variant: "destructive" 
        });
      } else {
        toast({ title: "Success", description: "Candidate created successfully with files." });
      }

      router.push('/dashboard/applications');
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h2 className="text-3xl font-headline font-bold">Add New Candidate</h2>
        </div>
        {lastSaved && (
          <p className="text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Draft Auto-saved at {new Date(lastSaved).toLocaleTimeString()}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <GlassCard noHover className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8 bg-white/5 border border-white/10 p-1 h-auto">
              <TabsTrigger value="basic" className="py-2 data-[state=active]:bg-indigo-600">Basic</TabsTrigger>
              <TabsTrigger value="job" className="py-2 data-[state=active]:bg-indigo-600">Job</TabsTrigger>
              <TabsTrigger value="education" className="py-2 data-[state=active]:bg-indigo-600">Education</TabsTrigger>
              <TabsTrigger value="additional" className="py-2 data-[state=active]:bg-indigo-600">Additional</TabsTrigger>
              <TabsTrigger value="documents" className="py-2 data-[state=active]:bg-indigo-600">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input name="candidateName" placeholder="John Doe" className="bg-white/5 border-white/10" value={formData.candidateName} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Email Address *</Label>
                  <Input name="email" type="email" placeholder="john@example.com" className="bg-white/5 border-white/10" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input name="dob" type="date" className="bg-white/5 border-white/10 block w-full" value={formData.dob} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={formData.gender} onValueChange={(v) => setFormData(p => ({ ...p, gender: v }))}>
                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent className="bg-[#0f111a] border-white/10 text-white">
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number *</Label>
                  <Input name="phone" placeholder="+1 555 000-0000" className="bg-white/5 border-white/10" value={formData.phone} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Input name="whatsappNumber" placeholder="+1 555 000-0000" className="bg-white/5 border-white/10" value={formData.whatsappNumber} onChange={handleChange} disabled={formData.whatsappSameAsPhone} />
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox id="whatsappSame" checked={formData.whatsappSameAsPhone} onCheckedChange={handleCheckboxChange} />
                    <label htmlFor="whatsappSame" className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      WhatsApp Same As Phone Number
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="button" onClick={() => handleNavTab('job')} className="bg-white/10 hover:bg-white/20">Next Section</Button>
              </div>
            </TabsContent>

            <TabsContent value="job" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Role Applied For *</Label>
                  <Input name="position" placeholder="e.g. Frontend Developer" className="bg-white/5 border-white/10" value={formData.position} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Years of Experience</Label>
                  <Input name="experience" placeholder="e.g. 5 years" className="bg-white/5 border-white/10" value={formData.experience} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Current CTC</Label>
                  <Input name="currentCTC" placeholder="e.g. 15 LPA" className="bg-white/5 border-white/10" value={formData.currentCTC} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Expected CTC</Label>
                  <Input name="expectedCTC" placeholder="e.g. 20 LPA" className="bg-white/5 border-white/10" value={formData.expectedCTC} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Notice Period</Label>
                  <Select value={formData.noticePeriodType} onValueChange={(v) => setFormData(p => ({ ...p, noticePeriodType: v }))}>
                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Select Notice Period" /></SelectTrigger>
                    <SelectContent className="bg-[#0f111a] border-white/10 text-white">
                      <SelectItem value="Immediate Joiner">Immediate Joiner</SelectItem>
                      <SelectItem value="No Notice Period Applicable">No Notice Period Applicable</SelectItem>
                      <SelectItem value="15 Days">15 Days</SelectItem>
                      <SelectItem value="30 Days">30 Days</SelectItem>
                      <SelectItem value="45 Days">45 Days</SelectItem>
                      <SelectItem value="60 Days">60 Days</SelectItem>
                      <SelectItem value="90 Days">90 Days</SelectItem>
                      <SelectItem value="Custom Days">Custom Days</SelectItem>
                      <SelectItem value="Custom Months">Custom Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {['Custom Days', 'Custom Months'].includes(formData.noticePeriodType) && (
                  <div className="space-y-2">
                    <Label>Number of {formData.noticePeriodType === 'Custom Months' ? 'Months' : 'Days'} *</Label>
                    <Input name="noticePeriodValue" type="number" placeholder={`e.g. ${formData.noticePeriodType === 'Custom Months' ? '2' : '45'}`} className="bg-white/5 border-white/10" value={formData.noticePeriodValue} onChange={handleChange} required />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Current Employer</Label>
                  <Input name="currentEmployer" placeholder="e.g. Google" className="bg-white/5 border-white/10" value={formData.currentEmployer} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Source of Applicant</Label>
                  <Select value={formData.source} onValueChange={(v) => setFormData(p => ({ ...p, source: v }))}>
                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Select Source" /></SelectTrigger>
                    <SelectContent className="bg-[#0f111a] border-white/10 text-white">
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Naukri">Naukri</SelectItem>
                      <SelectItem value="Indeed">Indeed</SelectItem>
                      <SelectItem value="Campus Drive">Campus Drive</SelectItem>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.source === 'Others' && (
                  <div className="space-y-2">
                    <Label>Please specify source *</Label>
                    <Input name="sourceDetails" placeholder="Specify here..." className="bg-white/5 border-white/10" value={formData.sourceDetails} onChange={handleChange} required />
                  </div>
                )}
              </div>
              <div className="flex justify-between pt-4">
                <Button type="button" onClick={() => handleNavTab('basic')} variant="ghost">Back</Button>
                <Button type="button" onClick={() => handleNavTab('education')} className="bg-white/10 hover:bg-white/20">Next Section</Button>
              </div>
            </TabsContent>

            <TabsContent value="education" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Qualification</Label>
                  <Input name="qualification" placeholder="e.g. B.Tech" className="bg-white/5 border-white/10" value={formData.qualification} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <Input name="specialization" placeholder="e.g. Computer Science" className="bg-white/5 border-white/10" value={formData.specialization} onChange={handleChange} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>College/University</Label>
                  <Input name="college" placeholder="e.g. MIT" className="bg-white/5 border-white/10" value={formData.college} onChange={handleChange} />
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button type="button" onClick={() => handleNavTab('job')} variant="ghost">Back</Button>
                <Button type="button" onClick={() => handleNavTab('additional')} className="bg-white/10 hover:bg-white/20">Next Section</Button>
              </div>
            </TabsContent>

            <TabsContent value="additional" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Languages Known</Label>
                  <Input name="languagesKnown" placeholder="English, Spanish" className="bg-white/5 border-white/10" value={formData.languagesKnown} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Current Residential Location</Label>
                  <Input name="currentLocation" placeholder="City, State" className="bg-white/5 border-white/10" value={formData.currentLocation} onChange={handleChange} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Skills (comma separated)</Label>
                  <Input name="skills" placeholder="React, TypeScript, Node.js" className="bg-white/5 border-white/10" value={formData.skills} onChange={handleChange} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Internal Notes</Label>
                  <Textarea name="notes" placeholder="Initial impressions..." className="bg-white/5 border-white/10 min-h-[100px]" value={formData.notes} onChange={handleChange} />
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button type="button" onClick={() => handleNavTab('education')} variant="ghost">Back</Button>
                <Button type="button" onClick={() => handleNavTab('documents')} className="bg-white/10 hover:bg-white/20">Next Section</Button>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Required */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-indigo-400">Required Documents</h4>
                  <div className="space-y-2">
                    <Label>Resume / CV *</Label>
                    <Input type="file" onChange={(e) => handleFileChange(e, 'resume')} className="bg-white/5 border-white/10 text-white" accept=".pdf,.doc,.docx" />
                  </div>
                  <div className="space-y-2">
                    <Label>Aadhar Card</Label>
                    <Input type="file" onChange={(e) => handleFileChange(e, 'aadhar')} className="bg-white/5 border-white/10 text-white" accept="image/*,.pdf" />
                  </div>
                  <div className="space-y-2">
                    <Label>Passport Size Photo</Label>
                    <Input type="file" onChange={(e) => handleFileChange(e, 'passportPhoto')} className="bg-white/5 border-white/10 text-white" accept="image/*" />
                  </div>
                </div>
                
                {/* Optional */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-cyan-400">Optional Documents</h4>
                  <div className="space-y-2">
                    <Label>PAN Card</Label>
                    <Input type="file" onChange={(e) => handleFileChange(e, 'panCard')} className="bg-white/5 border-white/10 text-white" accept="image/*,.pdf" />
                  </div>
                  <div className="space-y-2">
                    <Label>Experience Certificate</Label>
                    <Input type="file" onChange={(e) => handleFileChange(e, 'experienceCert')} className="bg-white/5 border-white/10 text-white" accept=".pdf" />
                  </div>
                  <div className="space-y-2">
                    <Label>Educational Certificates</Label>
                    <Input type="file" onChange={(e) => handleFileChange(e, 'educationCert')} className="bg-white/5 border-white/10 text-white" accept=".pdf" />
                  </div>
                  <div className="space-y-2">
                    <Label>Other Documents</Label>
                    <Input type="file" onChange={(e) => handleFileChange(e, 'otherDocs')} className="bg-white/5 border-white/10 text-white" accept=".pdf,.zip" />
                  </div>
                </div>
              </div>
              <div className="flex justify-between pt-8 border-t border-white/10">
                <Button type="button" onClick={() => handleNavTab('additional')} variant="ghost">Back</Button>
                <div className="flex gap-4">
                  <Button type="button" variant="secondary" className="bg-white/5 hover:bg-white/10 h-11" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={() => handleSaveDraft(formDataRef.current, false)} variant="outline" className="border-indigo-500/50 hover:bg-indigo-500/20 h-11">
                    Save as Draft
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-11 text-lg px-8 shadow-lg shadow-indigo-600/20">
                    {isSubmitting ? <Upload className="w-5 h-5 mr-2 animate-bounce" /> : <Save className="w-5 h-5 mr-2" />} 
                    {isSubmitting ? 'Uploading...' : 'Save Candidate'}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </GlassCard>
      </form>
    </div>
  );
}

export default function NewApplicationPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-12 text-white">Loading candidate form...</div>}>
      <NewApplicationForm />
    </Suspense>
  );
}
