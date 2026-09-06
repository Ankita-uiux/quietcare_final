"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { dinnerTimes, languages, mealTimes, medicines, patient } from "@/data/mock-data";
import { calculateCoverage } from "@/lib/routine";
import type { FlowScreen, QuietcareProgress } from "@/types/quietcare";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, Check, Download, Edit, Expand, Folder, Moon, Plus, Share, Sun, UserCircle } from "./icons";

const initialProgress: QuietcareProgress = { screen: "welcome", timingConfirmed: false, language: "Marathi", breakfast: "8:00 am", dinner: "7:30 pm" };
const backMap: Partial<Record<FlowScreen, FlowScreen>> = { "prescription-upload": "welcome", "prescription-review": "prescription-upload", "medicine-upload": "prescription-review", "medicine-review": "medicine-upload", personalise: "medicine-review", "routine-ready": "personalise", "labels-choice": "routine-ready", labels: "labels-choice", pack: "labels", connect: "pack", waiting: "connect", connected: "waiting" };

function StatusBar({ home = false }: { home?: boolean }) { return <div className={`status-bar${home ? " status-bar--home" : ""}`} aria-hidden><span>9:41</span><span className="status-icons"><i /><i /><b /></span></div>; }
function FlowHeader({ screen, onBack }: { screen: FlowScreen; onBack: () => void }) {
  const values: Partial<Record<FlowScreen, number>> = { "prescription-upload": 12, "prescription-review": 24, "medicine-upload": 34, "medicine-review": 44, personalise: 56, "labels-choice": 68, labels: 78, pack: 86, connect: 92, waiting: 96, connected: 100 };
  if (!(screen in values)) return null;
  return <div className="flow-header"><button className="icon-button" onClick={onBack} aria-label="Go back"><ArrowLeft /></button><div className="progress-track"><span style={{ width: `${values[screen]}%` }} /></div><span className="flow-spacer" /></div>;
}
function Bottom({ children }: { children: React.ReactNode }) { return <div className="bottom-actions">{children}</div>; }
function CaptureArt({ kind }: { kind: "prescription" | "medicine" }) {
  const source = kind === "prescription" ? "/assets/illustrations/upload-prescription.png" : "/assets/illustrations/add-medicines.png";
  return <div className={`capture-art capture-art--${kind}`}><Image src={source} alt="" fill sizes="190px" priority /></div>;
}
function Spinner() { return <span className="spinner" aria-hidden />; }
function LoadingScreen({ title, detail }: { title: string; detail: string }) { return <main className="center-screen" aria-live="polite"><Spinner /><h1>{title}</h1><p>{detail}</p></main>; }

function MedicineList({ timingConfirmed, onEdit }: { timingConfirmed: boolean; onEdit: () => void }) {
  return <div className="medicine-list">{!timingConfirmed && <article className="medicine-card medicine-card--warning"><div className="warning-label"><span>!</span> Timing unclear</div><h3>Vertin 2mg</h3><p>1-0-1 <b>•</b> After food <b>•</b> 3 days</p><Button onClick={onEdit}>Check timing</Button></article>}<div className="medicine-group">{medicines.slice(timingConfirmed ? 0 : 1).map((medicine) => <article className="medicine-row" key={medicine.id}><div><h3>{medicine.name}</h3><p>{medicine.schedule} <b>•</b> {medicine.timing} <b>•</b> {medicine.days} days</p><small>Special instructions</small></div><button className="edit-button" onClick={onEdit} aria-label={`Edit ${medicine.name}`}><Edit /></button></article>)}</div></div>;
}

function EditPrescription({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const timings = ["Before breakfast", "After breakfast", "Before lunch", "After lunch", "Before dinner", "After dinner", "SOS"];
  return <div className="modal-scrim"><section className="sheet" role="dialog" aria-modal="true" aria-labelledby="edit-title"><div className="sheet-header"><h2 id="edit-title">Edit</h2><button onClick={onClose} aria-label="Close"><Image src="/assets/icons/close.svg" alt="" width={24} height={24} /></button></div><label>Medicine Name<input value="Vertin 2mg" readOnly /></label><label>Dosage Days<input value="3" readOnly /></label><fieldset><legend>When is it supposed to be taken</legend>{timings.map((timing) => <label className="check-row" key={timing}><input type="checkbox" defaultChecked={timing === "After breakfast"} /><span><Check size={13} /></span>{timing}</label>)}</fieldset><div className="sheet-actions"><Button variant="danger" onClick={onClose}>Remove</Button><Button onClick={onSave}>Save</Button></div></section></div>;
}

function UploadActions({ onChoose, onTake, selectedName }: { onChoose: () => void; onTake: () => void; selectedName?: string }) {
  return <Bottom>{selectedName && <div className="file-chip">Selected: {selectedName}</div>}<div className="split-actions"><Button variant="secondary" onClick={onChoose}><Folder /> Choose photo</Button><Button onClick={onTake}><Camera /> Take photo</Button></div></Bottom>;
}

function UploadModal({ medicine, onClose, onSelect }: { medicine: boolean; onClose: () => void; onSelect: (file?: File) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return <div className="modal-scrim modal-scrim--center"><section className="upload-dialog" role="dialog" aria-modal="true" aria-labelledby="upload-title"><div className="sheet-header"><h2 id="upload-title">Upload {medicine ? "medicine photo" : "prescription"}</h2><button onClick={onClose} aria-label="Close"><Image src="/assets/icons/close.svg" alt="" width={24} height={24} /></button></div><div className="upload-drop"><Folder size={32}/><strong>Choose a file from your device</strong><span>{medicine ? "JPG or PNG" : "JPG, PNG or PDF"}</span><Button onClick={() => input.current?.click()}>Browse files</Button><input ref={input} className="sr-only" type="file" accept={medicine ? "image/*" : "image/*,.pdf,application/pdf"} onChange={(event) => onSelect(event.target.files?.[0])}/></div><Button variant="secondary" onClick={onClose}>Cancel</Button></section></div>;
}

function PrescriptionReview({ timingConfirmed, onEdit, onContinue }: { timingConfirmed: boolean; onEdit: () => void; onContinue: () => void }) {
  return <main className="screen-content screen-content--review"><h1>Review prescription</h1><p>We found 4 medicines. Check {timingConfirmed ? "the details" : "1 unclear detail"} before continuing.</p><div className="prescription-preview"><Image src="/assets/images/prescription.png" alt="Uploaded prescription" fill sizes="342px" priority /><button aria-label="Expand prescription"><Expand size={18}/></button><div>{patient.prescriptionName} <b>•</b> {patient.courseDays} days course</div></div><MedicineList timingConfirmed={timingConfirmed} onEdit={onEdit} /><Bottom><Button variant={timingConfirmed ? "primary" : "disabled"} disabled={!timingConfirmed} onClick={onContinue}>Confirm Prescription</Button></Bottom></main>;
}

function MedicineReview({ onEdit, onContinue }: { onEdit: () => void; onContinue: () => void }) {
  const tags: Array<[number, number, string, string]> = [[2,32,"Glycomet 500mg","20 Tab"],[55,31,"Telma 40mg","20 Tab"],[4,48,"Atorvastatin","20 Tab"],[67,60,"Dolo 500mg","20 Tab"],[2,70,"Glimepride","20 Tab"],[35,64,"Lumia 60k","8 Cap"],[38,77,"Pan 40mg","20 Tab"],[2,91,"Amlodipine","20 Tab"],[37,93,"Pan 40mg","20 Tab"],[69,91,"Ecosprin","20 Tab"]];
  return <main className="photo-review"><div className="medicine-photo"><Image src="/assets/images/medicines-flatlay.png" alt="Detected medicine packages laid flat" fill sizes="390px" priority /><button onClick={onEdit} aria-label="Edit matches"><Edit /></button>{tags.map(([x,y,name,qty]) => <span className="detection-tag" style={{ left: `${x}%`, top: `${y}%` }} key={`${name}-${x}-${y}`}>{name}<b>{qty}</b></span>)}</div><Bottom><Button onClick={onContinue}>Confirm Prescription</Button></Bottom></main>;
}

function EditMedicine({ onClose }: { onClose: () => void }) { return <div className="modal-scrim"><section className="sheet sheet--short" role="dialog" aria-modal="true"><div className="sheet-header"><h2>Edit</h2><button onClick={onClose} aria-label="Close"><Image src="/assets/icons/close.svg" alt="" width={24} height={24}/></button></div><label>Match with Prescription<select defaultValue="Vertin 2mg"><option>Vertin 2mg</option><option>Metformin 500mg</option><option>Telma 40mg</option></select></label><label>Available Quantity (Tablets/Units)<input type="number" defaultValue="20" min="0" /></label><div className="sheet-actions"><Button variant="danger" onClick={onClose}>Remove</Button><Button onClick={onClose}>Save</Button></div></section></div>; }

function LabelsPreview() {
  const labels = [["before-breakfast.png", "Before breakfast"], ["after-breakfast.png", "After breakfast"], ["before-dinner.png", "Before dinner"], ["after-dinner.png", "After dinner"]];
  return <div className="labels-card"><p>4 &nbsp; pouch labels</p><div className="label-grid">{labels.map(([file, alt]) => <Image key={file} src={`/assets/pouch-labels/${file}`} alt={alt} width={150} height={184}/>)}</div></div>;
}

function HomeScreen({ onAddPrescription }: { onAddPrescription: () => void }) {
  return <main className="home-screen"><header className="home-header"><strong>quietcare</strong><button aria-label="Profile"><UserCircle size={24}/></button><span>{patient.name}<Image src="/assets/icons/chevron-down.svg" alt="" width={14} height={14}/></span></header><div className="home-body"><section className="today-card"><div className="section-title"><h2>Today</h2><span>On track</span></div><div className="today-grid"><div className="dose-ring"><span>Last Dose</span><b>2:30 PM</b></div><div className="dose-times"><p><Sun size={26}/><span>Last Dose<strong>After Lunch</strong></span></p><p><Moon size={26}/><span>Next Dose<strong>Before Dinner</strong></span></p></div></div></section><section className="refill-alert"><b>!</b><span><strong>Telma 40 may run out soon</strong>About 4 days remaining</span><button>Review</button></section><h2 className="home-section-title">Prepared Pouches</h2><section className="pouches-card"><div><span>{patient.name}&apos;s routine<strong>Prepared through {patient.preparedThrough}</strong></span><b>{patient.daysLeft} days left</b></div><Image src="/assets/images/prepared-pouches.png" alt="Four prepared medicine pouches" width={340} height={117} /><div className="card-actions"><Button variant="secondary">Prepare more</Button><Button>View routine</Button></div></section><h2 className="home-section-title">Records</h2><div className="record-grid"><button><Image src="/assets/illustrations/prescriptions-record.png" alt="" width={100} height={100}/><span>Prescriptions</span></button><button><Image src="/assets/illustrations/stock-record.png" alt="" width={100} height={100}/><span>Stock</span></button></div></div><button className="fab" onClick={onAddPrescription}><Plus /> Add prescription</button></main>;
}

export function QuietcareApp() {
  const [progress, setProgress] = useState(initialProgress);
  const [prescriptionModal, setPrescriptionModal] = useState(false);
  const [medicineModal, setMedicineModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [selectedName, setSelectedName] = useState<string>();
  const coverage = useMemo(() => calculateCoverage(medicines), []);

  useEffect(() => { const transitions: Partial<Record<FlowScreen, FlowScreen>> = { "prescription-loading": "prescription-review", "medicine-loading": "medicine-review", "routine-loading": "routine-ready", "routine-ready": "labels-choice", waiting: "connected" }; const next = transitions[progress.screen]; if (!next) return; const delay = progress.screen === "waiting" ? 2400 : 1400; const timer = window.setTimeout(() => setProgress((current) => ({ ...current, screen: next })), delay); return () => window.clearTimeout(timer); }, [progress.screen]);

  const go = (screen: FlowScreen) => setProgress((current) => ({ ...current, screen }));
  const back = () => go(backMap[progress.screen] ?? "welcome");
  const startNewPrescription = () => {
    setProgress({ ...initialProgress, screen: "prescription-upload" });
    setSelectedName(undefined);
  };
  const upload = (file?: File) => {
    if (file) setSelectedName(file.name);
    go(progress.screen === "prescription-upload" ? "prescription-loading" : "medicine-loading");
  };

  if (progress.screen === "home") return <div className="app-shell app-shell--home"><StatusBar home /><HomeScreen onAddPrescription={startNewPrescription} /></div>;

  let content: React.ReactNode;
  switch (progress.screen) {
    case "welcome": content = <main className="welcome-screen"><div className="welcome-photo"><Image src="/assets/images/welcome-caregiver.png" alt="A caregiver and her parent reviewing medicine information" fill priority sizes="342px" /></div><div className="brand-mark"><Image src="/assets/brand/quietcare-logo.png" alt="Quietcare" width={94} height={94} priority /></div><div className="welcome-copy"><h1>Welcome to Quietcare</h1><p>Turn your parent&apos;s prescription and available<br/>medicines into a clear routine.</p></div><Bottom><Button onClick={() => go("prescription-upload")}>Add Prescription</Button></Bottom></main>; break;
    case "prescription-upload": content = <main className="screen-content"><h1>Upload photos of their<br/>prescription</h1><p>We&apos;ll read it and build a clear medicine routine for your parent.</p><CaptureArt kind="prescription"/><UploadActions selectedName={selectedName} onChoose={() => setUploadModal(true)} onTake={() => go("prescription-loading")}/></main>; break;
    case "prescription-loading": content = <LoadingScreen title="Reading your prescription" detail="Finding medicine names, doses and timings…"/>; break;
    case "prescription-review": content = <PrescriptionReview timingConfirmed={progress.timingConfirmed} onEdit={() => setPrescriptionModal(true)} onContinue={() => go("medicine-upload")}/>; break;
    case "medicine-upload": content = <main className="screen-content"><h1>Add a photo of the medicines</h1><p>We&apos;ll match them to the prescription and show how many doses can be prepared.</p><CaptureArt kind="medicine"/><ul className="capture-tips">{["Place medicines on a flat surface","Keep names facing up","Avoid overlapping packages","Use good lighting"].map((tip) => <li key={tip}><span><Check size={11}/></span>{tip}</li>)}</ul><UploadActions onChoose={() => setUploadModal(true)} onTake={() => go("medicine-loading")}/></main>; break;
    case "medicine-loading": content = <LoadingScreen title="Matching medicines" detail="Comparing the medicines with the prescription…"/>; break;
    case "medicine-review": content = <MedicineReview onEdit={() => setMedicineModal(true)} onContinue={() => go("personalise")}/>; break;
    case "personalise": content = <main className="screen-content"><h1>Personalise your parent&apos;s<br/>routine</h1><p>We&apos;ll use these details for their medicine reminders.</p><div className="form-stack"><label>Preferred language<select value={progress.language} onChange={(event) => setProgress({...progress, language:event.target.value})}>{languages.map((value)=><option key={value}>{value}</option>)}</select></label><fieldset><legend>Usual meal times</legend><label>Breakfast<select value={progress.breakfast} onChange={(event) => setProgress({...progress, breakfast:event.target.value})}>{mealTimes.map((value)=><option key={value}>{value}</option>)}</select></label><label>Dinner<select value={progress.dinner} onChange={(event) => setProgress({...progress, dinner:event.target.value})}>{dinnerTimes.map((value)=><option key={value}>{value}</option>)}</select></label></fieldset></div><Bottom><Button onClick={() => go("routine-loading")}>Create Routine</Button></Bottom></main>; break;
    case "routine-loading": content = <LoadingScreen title="Creating your routine" detail="Calculating doses and available days…"/>; break;
    case "routine-ready": content = <main className="center-screen"><span className="success-check"><Check size={30}/></span><h1>Your routine is ready</h1><p>The available medicines will cover {coverage} days.</p></main>; break;
    case "labels-choice": content = <main className="screen-content"><h1>Would you like to prepare<br/>labelled medicine pouches?</h1><p>Each pouch shows what your parent takes and when. We&apos;ll create the labels and guide you through packing.</p><div className="choice-illustration"><Image src="/assets/illustrations/label-choice.png" alt="A hand placing a label on a medicine pouch" width={310} height={326}/></div><Bottom><div className="split-actions"><Button variant="secondary" onClick={() => go("connect")}>Skip</Button><Button onClick={() => go("labels")}>Yes, create labels</Button></div></Bottom></main>; break;
    case "labels": content = <main className="screen-content"><h1>Prepare the medicine pouches</h1><p>Print these labels, cut them out and stick one on each pouch. Then return here to continue</p><LabelsPreview/><Bottom><div className="split-actions"><Button variant="secondary"><Share size={20}/> Share</Button><Button onClick={() => go("pack")}><Download size={20}/> Download pdf</Button></div></Bottom></main>; break;
    case "pack": content = <main className="screen-content pack-screen"><h1>Pack medicines</h1><p>Find the highlighted medicine in your photo, then add the shown amount.</p><div className="pack-photo"><Image src="/assets/images/medicines-highlighted.png" alt="Highlighted medicine packages" fill sizes="390px" /></div><div className="packet-summary"><Image src="/assets/pouch-labels/before-breakfast.png" alt="Before breakfast pouch label" width={70} height={86}/><p>Packet 1<strong>Before breakfast</strong></p></div><div className="packing-row"><b>1</b><span>Glycomet 500mg<strong>Cut 7 sealed tablets</strong></span></div><div className="packing-row"><b>2</b><span>Cholecalciferol<strong>Cut 7 sealed tablets</strong></span></div><Bottom><Button onClick={() => go("connect")}>Next round</Button></Bottom></main>; break;
    case "connect": content = <main className="screen-content"><h1>Connect your parent on<br/>Telegram</h1><p>Send them a secure link. They must open it and tap Start before reminders can begin.</p><div className="telegram-illustration"><Image src="/assets/illustrations/telegram-connect.png" alt="Telegram connection illustration" fill sizes="342px"/></div><ul className="capture-tips connect-steps">{["Share the Telegram link","Your parent taps Start","Medicine reminders begin"].map((step)=><li key={step}><span><Check size={11}/></span>{step}</li>)}</ul><Bottom><Button onClick={() => go("waiting")}>Share Telegram link</Button></Bottom></main>; break;
    case "waiting": content = <main className="screen-content"><h1>Waiting for your parent</h1><p>We&apos;ll let you know when they open Telegram and tap Start.</p><div className="telegram-illustration"><Image src="/assets/illustrations/telegram-waiting.png" alt="Waiting for Telegram connection" fill sizes="342px"/></div></main>; break;
    case "connected": content = <main className="screen-content"><h1>Your parent is connected</h1><p>Medicine reminders will begin with their next scheduled dose.</p><div className="telegram-illustration"><Image src="/assets/illustrations/telegram-connected.png" alt="Telegram successfully connected" fill sizes="342px"/></div><Bottom><Button onClick={() => go("home")}>Finish Setup</Button></Bottom></main>; break;
  }

  return <div className="app-shell"><StatusBar /><FlowHeader screen={progress.screen} onBack={back}/>{content}{prescriptionModal && <EditPrescription onClose={() => setPrescriptionModal(false)} onSave={() => { setProgress({...progress,timingConfirmed:true}); setPrescriptionModal(false); }}/>} {medicineModal && <EditMedicine onClose={() => setMedicineModal(false)}/>} {uploadModal && <UploadModal medicine={progress.screen === "medicine-upload"} onClose={() => setUploadModal(false)} onSelect={(file) => { setUploadModal(false); upload(file); }}/>}</div>;
}
