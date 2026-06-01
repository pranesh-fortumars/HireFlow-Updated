"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useHireFlowStore } from '@/lib/store';
import { useAuth } from '@/components/auth-context';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Mail, Phone, Briefcase, FileText, Calendar, Star, 
  CheckCircle2, XCircle, MessageSquare, Clock, Video, ExternalLink, 
  ShieldAlert, MapPin, Landmark, GraduationCap, Download, CheckCircle, HelpCircle
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { VerificationStatus, ApplicationStatus, DocumentVerification } from '@/lib/types';

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { applications, interviewers, scheduleInterview, submitFeedback, updateApplication } = useHireFlowStore();
  const { toast } = useToast();

  const app = applications.find(a => a.id === id);

  // Scheduling State
  const [interviewerId, setInterviewerId] = useState(app?.assignedInterviewerId || '');
  const [date, setDate] = useState(app?.interviewDate || '');
  const [time, setTime] = useState(app?.interviewTime || '');
  const [mode, setMode] = useState<'ONLINE' | 'OFFLINE'>(app?.interviewMode || 'ONLINE');
  const [meetLink, setMeetLink] = useState(app?.googleMeetLink || '');

  // Feedback State
  const [feedback, setFeedback] = useState({
    technicalRating: app?.feedback?.technicalRating || 5,
    communicationRating: app?.feedback?.communicationRating || 5,
    problemSolvingRating: app?.feedback?.problemSolvingRating || 5,
    domainKnowledgeRating: app?.feedback?.domainKnowledgeRating || 5,
    recommendation: app?.feedback?.recommendation || 'HOLD' as any,
    comments: app?.feedback?.comments || ''
  });

  if (!app) return <div className="text-center py-20 text-muted-foreground">Loading candidate profile...</div>;

  const isInterviewer = user?.role === 'INTERVIEWER' && app.assignedInterviewerId === user.id;
  const isHR = user?.role === 'HR';
  const isAdmin = user?.role === 'ADMIN';

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    try {
      await updateApplication(app.id, { status: newStatus });
      toast({ title: "Status Updated", description: `Candidate moved to ${newStatus}` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleSchedule = () => {
    scheduleInterview(app.id, {
      assignedInterviewerId: interviewerId,
      interviewDate: date,
      interviewTime: time,
      interviewMode: mode,
      googleMeetLink: meetLink
    });
    toast({ title: "Scheduled", description: "Interview successfully scheduled." });
  };

  const handleFeedback = () => {
    submitFeedback(app.id, {
      ...feedback,
      submittedAt: new Date().toISOString()
    });
    toast({ title: "Feedback Saved", description: "Evaluation submitted successfully." });
    if (isInterviewer) router.push('/dashboard/my-interviews');
  };

  const handleVerifyDoc = async (docType: string, status: VerificationStatus) => {
    try {
      const currentVerification = app.verification || { aadhar: 'Pending', education: 'Pending', employment: 'Pending', identity: 'Pending' };
      await updateApplication(app.id, { 
        verification: { ...currentVerification, [docType]: status } 
      });
      toast({ title: "Verification Updated", description: `${docType} marked as ${status}` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  // Generating a pseudo timeline
  const timelineEvents = [
    { title: "Application Received", date: new Date(app.createdAt).toLocaleString(), icon: <FileText className="w-4 h-4 text-emerald-400" /> },
  ];
  if (app.interviewDate) {
    timelineEvents.push({ title: "Interview Scheduled", date: new Date(`${app.interviewDate}T${app.interviewTime || '00:00'}`).toLocaleString(), icon: <Calendar className="w-4 h-4 text-indigo-400" /> });
  }
  if (app.feedback) {
    timelineEvents.push({ title: "Feedback Submitted", date: new Date(app.feedback.submittedAt).toLocaleString(), icon: <Star className="w-4 h-4 text-amber-400" /> });
  }

  const allStatuses: ApplicationStatus[] = [
    'Pending', 'Scheduled', 'Appeared', 'Cancelled', 'No Response',
    'Attended 1st Round', 'Selected 1st Round', 'Rejected 1st Round', 'Waiting For 1st Round Result',
    'Scheduled 2nd Round', 'Attended 2nd Round', 'Selected 2nd Round', 'Rejected 2nd Round', 'Waiting For 2nd Round Result',
    'HR Discussion', 'Document Verification', 'Background Verification',
    'Offer Released', 'Joined', 'Rejected', 'Hold'
  ];

  const verification = app.verification || { aadhar: 'Pending', education: 'Pending', employment: 'Pending', identity: 'Pending' };
  const isImmediate = app.noticePeriodType === 'Immediate Joiner' || app.noticePeriodType === 'No Notice Period Applicable';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-headline font-bold">{app.candidateName}</h2>
              {isImmediate && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                  Immediate Joiner
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground font-mono mt-1">{app.referenceNumber || app.id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {(isHR || isAdmin) && (
            <Select value={app.status} onValueChange={(val: ApplicationStatus) => handleStatusChange(val)}>
              <SelectTrigger className="w-[240px] h-10 bg-white/5 border-white/10 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0f111a] border-white/10 text-white max-h-[300px]">
                {allStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Badge className="bg-indigo-500/10 text-indigo-400 text-base py-1.5 px-4 font-semibold uppercase tracking-wider">
            {app.status}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 bg-white/5 border border-white/10 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600">Overview</TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-indigo-600">Documents & Verification</TabsTrigger>
          <TabsTrigger value="interview" className="data-[state=active]:bg-indigo-600">Interview & Feedback</TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-indigo-600">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <GlassCard noHover>
                <div className="text-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 mx-auto flex items-center justify-center text-4xl font-bold mb-4 shadow-lg shadow-indigo-500/20">
                    {app.candidateName.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold font-headline">{app.candidateName}</h3>
                  <p className="text-indigo-400 font-medium">{app.position}</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" /> <span>{app.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" /> <span>{app.phone}</span>
                  </div>
                  {app.whatsappNumber && (
                    <div className="flex items-center gap-3 text-sm">
                      <MessageSquare className="w-4 h-4 text-emerald-400" /> <span>{app.whatsappNumber} (WhatsApp)</span>
                    </div>
                  )}
                  {app.currentLocation && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" /> <span>{app.currentLocation}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-3">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {app.skills.map(skill => (
                      <Badge key={skill} variant="secondary" className="bg-white/5 border-white/10 hover:bg-white/10">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <GlassCard noHover>
                <h3 className="text-lg font-headline font-semibold mb-4 text-indigo-300">Professional Background</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-muted-foreground mb-1">Experience</p>
                    <p className="font-medium">{app.experience || 'Not provided'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-muted-foreground mb-1">Current Employer</p>
                    <p className="font-medium">{app.currentEmployer || 'Not provided'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-muted-foreground mb-1">Current CTC</p>
                    <p className="font-medium">{app.currentCTC || 'Not provided'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-muted-foreground mb-1">Expected CTC</p>
                    <p className="font-medium text-emerald-400">{app.expectedCTC || 'Not provided'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-muted-foreground mb-1">Notice Period</p>
                    <p className="font-medium">
                      {(app.noticePeriodType === 'Custom Days' || app.noticePeriodType === 'Custom Months') 
                        ? `${app.noticePeriodValue} ${app.noticePeriodUnit}` 
                        : (app.noticePeriodType || app.noticePeriod || 'Not provided')}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-xs text-muted-foreground mb-1">Source</p>
                    <p className="font-medium">{app.source || 'Direct'} {app.sourceDetails ? `- ${app.sourceDetails}` : ''}</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard noHover>
                <h3 className="text-lg font-headline font-semibold mb-4 text-cyan-300">Education Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 flex gap-3">
                    <GraduationCap className="w-5 h-5 text-cyan-400 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Qualification</p>
                      <p className="font-medium">{app.qualification || 'N/A'} {app.specialization ? `(${app.specialization})` : ''}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 flex gap-3">
                    <Landmark className="w-5 h-5 text-cyan-400 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">College/University</p>
                      <p className="font-medium">{app.college || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {app.notes && (
                <GlassCard noHover>
                  <h3 className="text-lg font-headline font-semibold mb-2">Internal Notes</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{app.notes}</p>
                </GlassCard>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <GlassCard noHover>
              <h3 className="text-xl font-headline font-semibold mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-400" /> Uploaded Documents
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Resume / CV', url: app.documents?.resumeUrl || app.resumeUrl },
                  { label: 'Aadhar Card', url: app.documents?.aadharUrl },
                  { label: 'PAN Card', url: app.documents?.panCardUrl },
                  { label: 'Experience Certificate', url: app.documents?.experienceCertUrl },
                  { label: 'Education Certificate', url: app.documents?.educationCertUrl }
                ].map(doc => doc.url ? (
                  <div key={doc.label} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-400" />
                      <span className="font-medium">{doc.label}</span>
                    </div>
                    <a href={doc.url} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="secondary" className="bg-white/10 hover:bg-indigo-600"><Download className="w-4 h-4 mr-2" /> View</Button>
                    </a>
                  </div>
                ) : null)}
                
                {!app.documents?.resumeUrl && !app.resumeUrl && (
                  <p className="text-muted-foreground text-sm py-4 text-center">No documents uploaded.</p>
                )}
              </div>
            </GlassCard>

            <GlassCard noHover>
              <h3 className="text-xl font-headline font-semibold mb-6 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-emerald-400" /> Verification Workflow
              </h3>
              <p className="text-sm text-muted-foreground mb-6">Track background checks and document authenticity. Only HR or Admins should update these statuses.</p>
              
              <div className="space-y-4">
                {[
                  { key: 'identity', label: 'Identity Verification (PAN/Photo)' },
                  { key: 'aadhar', label: 'Aadhar Verification' },
                  { key: 'education', label: 'Education Verification' },
                  { key: 'employment', label: 'Past Employment Verification' }
                ].map(v => (
                  <div key={v.key} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div>
                      <p className="font-medium">{v.label}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs">
                        {verification[v.key as keyof DocumentVerification] === 'Verified' ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : 
                         verification[v.key as keyof DocumentVerification] === 'Rejected' ? <XCircle className="w-3 h-3 text-rose-400" /> : 
                         <HelpCircle className="w-3 h-3 text-amber-400" />}
                        <span className={
                          verification[v.key as keyof DocumentVerification] === 'Verified' ? 'text-emerald-400' :
                          verification[v.key as keyof DocumentVerification] === 'Rejected' ? 'text-rose-400' : 'text-amber-400'
                        }>{verification[v.key as keyof DocumentVerification]}</span>
                      </div>
                    </div>
                    {(isHR || isAdmin) && (
                      <Select value={verification[v.key as keyof DocumentVerification]} onValueChange={(val: VerificationStatus) => handleVerifyDoc(v.key, val)}>
                        <SelectTrigger className="w-[120px] h-8 bg-transparent border-white/10 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f111a] border-white/10 text-white">
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Verified">Verified</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </TabsContent>

        <TabsContent value="interview" className="space-y-8">
          {/* HR Scheduling View */}
          {(isHR || isAdmin) && (
            <GlassCard noHover>
              <h3 className="text-xl font-headline font-semibold mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-indigo-400" /> Interview Scheduling
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2 lg:col-span-1">
                  <Label>Select Interviewer</Label>
                  <Select value={interviewerId} onValueChange={setInterviewerId}>
                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Choose interviewer" /></SelectTrigger>
                    <SelectContent className="bg-[#1e1b4b] border-white/10 text-white">
                      {interviewers.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white/5 border-white/10 dark:[color-scheme:dark]" />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-white/5 border-white/10 dark:[color-scheme:dark]" />
                </div>
                <div className="space-y-2">
                  <Label>Mode</Label>
                  <Select value={mode} onValueChange={(val: any) => setMode(val)}>
                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1e1b4b] border-white/10 text-white">
                      <SelectItem value="ONLINE">Online (Video Call)</SelectItem>
                      <SelectItem value="OFFLINE">Offline (In-person)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label>Meeting Link (e.g. Google Meet)</Label>
                  <Input placeholder="https://meet.google.com/xxx-xxxx-xxx" value={meetLink} onChange={(e) => setMeetLink(e.target.value)} className="bg-white/5 border-white/10" />
                </div>
              </div>
              <Button onClick={handleSchedule} className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-lg">
                {app.interviewDate ? 'Update Schedule' : 'Schedule Interview'}
              </Button>
            </GlassCard>
          )}

          {/* Interviewer Feedback View */}
          {(isInterviewer || app.feedback || isHR || isAdmin) && (
            <GlassCard noHover className={app.feedback ? 'border-emerald-500/20' : 'border-indigo-500/20'}>
              <h3 className="text-xl font-headline font-semibold mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-400" /> 
                {app.feedback ? 'Interview Feedback Submitted' : 'Submit Feedback'}
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Technical Skills', key: 'technicalRating' },
                    { label: 'Communication', key: 'communicationRating' },
                    { label: 'Problem Solving', key: 'problemSolvingRating' },
                    { label: 'Domain Knowledge', key: 'domainKnowledgeRating' }
                  ].map(rating => (
                    <div key={rating.key} className="space-y-2">
                      <Label className="flex justify-between">
                        {rating.label} <span className="text-indigo-400 font-bold">{(feedback as any)[rating.key]}/10</span>
                      </Label>
                      <Input 
                        type="range" min="1" max="10" 
                        value={(feedback as any)[rating.key]} 
                        onChange={(e) => setFeedback(prev => ({ ...prev, [rating.key]: parseInt(e.target.value) }))}
                        disabled={!!app.feedback && (!isHR && !isAdmin)} // If feedback exists, only let HR/Admin view, they shouldn't edit easily but let's just disable it if it exists
                        className="h-2 bg-indigo-900/40 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Final Recommendation</Label>
                  <Select 
                    value={feedback.recommendation} 
                    onValueChange={(val: any) => setFeedback(prev => ({ ...prev, recommendation: val }))}
                    disabled={!!app.feedback && (!isHR && !isAdmin)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e1b4b] border-white/10 text-white">
                      <SelectItem value="SELECTED">Selected - Hire Immediately</SelectItem>
                      <SelectItem value="HOLD">Hold - Needs Review</SelectItem>
                      <SelectItem value="REJECTED">Rejected - Not a Fit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Overall Assessment & Comments</Label>
                  <Textarea 
                    value={feedback.comments} 
                    onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
                    disabled={!!app.feedback && (!isHR && !isAdmin)}
                    className="bg-white/5 border-white/10 min-h-[150px]"
                    placeholder="Describe the candidate's strengths, weaknesses, and potential culture fit..."
                  />
                </div>

                {!app.feedback && isInterviewer && (
                  <Button onClick={handleFeedback} className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 h-11 text-lg">
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Submit Final Assessment
                  </Button>
                )}
                
                {app.feedback && (
                  <div className="p-6 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Final Verdict</p>
                      <div className="flex items-center gap-3">
                        {app.feedback.recommendation === 'SELECTED' ? <CheckCircle2 className="w-8 h-8 text-emerald-500" /> : 
                         app.feedback.recommendation === 'REJECTED' ? <XCircle className="w-8 h-8 text-rose-500" /> : 
                         <Clock className="w-8 h-8 text-amber-500" />}
                        <span className="text-xl font-bold">{app.feedback.recommendation}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Submitted On</p>
                      <p className="font-medium">{new Date(app.feedback.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          )}

          {!isHR && !isInterviewer && !isAdmin && !app.feedback && (
            <GlassCard noHover className="flex flex-col items-center justify-center text-center py-20 opacity-60">
              <ShieldAlert className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-headline font-semibold">Evaluation in Progress</h3>
              <p className="text-muted-foreground">Only assigned interviewers and HR can view assessment controls.</p>
            </GlassCard>
          )}
        </TabsContent>

        <TabsContent value="timeline">
          <GlassCard noHover>
            <h3 className="text-xl font-headline font-semibold mb-8">Activity Timeline</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {timelineEvents.map((event, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-[#0B0C14] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    {event.icon}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-white">{event.title}</div>
                    </div>
                    <div className="text-sm text-indigo-300">{event.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
