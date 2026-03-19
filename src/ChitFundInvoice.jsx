import React, { useState, useRef } from "react";
import logo from "./Logoo.png";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Button } from "@mui/material";
import adsImage from "../src/assets/ChitADS.png";

export default function ChitFundInvoice() {

const invoiceRef = useRef(null);
const signatureRef = useRef(null);

const [loading,setLoading] = useState(false);

const [form,setForm] = useState({
customerName:"",
date:formatDateInput(new Date()),
chitNumber:"",
planName:"",
planAmount:"",
cashReceived:"₹",
paymentType:"Cash",
agentName:"-",
userType:"Chit User",
notes:"--",
signature:""
});

// SAFE display format (dd/mm/yyyy)
function formatDateInput(date){
  if(!date) return "";

  if(date instanceof Date){
    return date.toISOString().split("T")[0]; // yyyy-mm-dd
  }

  // already yyyy-mm-dd
  if(typeof date === "string" && date.includes("-")){
    return date;
  }

  return "";
}
// function formatDate(dateStr){
//   if(!dateStr) return "-";
//   const [y,m,d] = dateStr.split("-");
//   return `${d}/${m}/${y}`;
// }

function handleChange(e){
const {name,value}=e.target;
setForm(s=>({...s,[name]:value}));
}

function formatCurrency(val){
if(!val) return "-";
const n=Number(val);
if(Number.isNaN(n)) return val;
return n.toLocaleString("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});
}

function getPlanLabel(val){
const plans={
"100000":"₹1,00,000",
"200000":"₹2,00,000",
"500000":"₹5,00,000",
"1000000":"₹10,00,000"
};
return plans[val]||"-";
}

async function generatePDF(){

const input=invoiceRef.current;

const canvas=await html2canvas(input,{
scale:3,
useCORS:true
});

const imgData=canvas.toDataURL("image/png");

const pdf=new jsPDF("p","pt","a4");

const pdfWidth=pdf.internal.pageSize.getWidth();
const imgProps=pdf.getImageProperties(imgData);

const imgWidth=pdfWidth;
const imgHeight=(imgProps.height*imgWidth)/imgProps.width;

pdf.addImage(imgData,"PNG",0,0,imgWidth,imgHeight);

return pdf;

}

async function handleDownloadPDF(){

setLoading(true);

try{

const pdf=await generatePDF();

const blob=pdf.output("blob");

const filename=`Payment_receipt_${(form.customerName||"customer").replace(/\s+/g,"_")}.pdf`;

const url=URL.createObjectURL(blob);

const a=document.createElement("a");
a.href=url;
a.download=filename;

document.body.appendChild(a);
a.click();
a.remove();

setTimeout(()=>URL.revokeObjectURL(url),10000);

}catch(err){

console.error(err);

}

setLoading(false);

}

async function handleShareWhatsApp(){

setLoading(true);

try{

const pdf=await generatePDF();

const blob=pdf.output("blob");

const filename=`Payment_receipt_${(form.customerName||"customer").replace(/\s+/g,"_")}.pdf`;

const file=new File([blob],filename,{type:"application/pdf"});

if(navigator.share && navigator.canShare && navigator.canShare({files:[file]})){

await navigator.share({
title:"TRS Chit Fund Receipt",
text:"Here is your payment receipt from TRS Chit Fund",
files:[file]
});

return;

}

const url=URL.createObjectURL(blob);

const a=document.createElement("a");
a.href=url;
a.download=filename;

document.body.appendChild(a);
a.click();
a.remove();

const text=encodeURIComponent("Receipt generated. Please attach the downloaded PDF.");

window.open(`https://wa.me/?text=${text}`,"_blank");

setTimeout(()=>URL.revokeObjectURL(url),10000);

}catch(err){

console.error(err);

alert("Sharing failed. PDF downloaded instead.");

}

setLoading(false);

}

return(

<div className="min-h-screen bg-gray-50 p-4 sm:p-8 flex flex-col items-center">

<div className="w-full max-w-xl">

{/* HEADER */}

<div className="flex flex-col items-center text-center mt-5">

<img src={logo} alt="logo" className="h-24 w-20 object-contain"/>

<h1 className="text-2xl font-bold">TRS Chit Fund</h1>

<p className="text-gray-600 text-sm">
2B, ChinnaSamy Naidu Street, Dharmapuri-636701
</p>

<p className="text-gray-600 text-sm">
Contact: Ramesh-9444545907 & Siva-7200120078
</p>

</div>


{/* FORM */}

<div className="bg-white shadow rounded-lg mt-4 p-4">

<form className="grid grid-cols-1 gap-3">

<label className="text-sm">Name</label>

<input
name="customerName"
value={form.customerName}
onChange={handleChange}
className="input"
/>

<div className="grid grid-cols-2 gap-3">

<div>
<label className="text-sm">Date</label>
<input
name="date"
type="date"
value={formatDateInput(form.date)}
onChange={handleChange}
className="input"
/>
</div>

<div>
<label className="text-sm">Month</label>
<input
name="chitNumber"
value={form.chitNumber}
onChange={handleChange}
className="input"
/>
</div>

</div>

<div className="grid grid-cols-2 gap-3">

<div>
<label className="text-sm">Plan Name</label>
<input
name="planName"
value={form.planName}
onChange={handleChange}
className="input"
/>
</div>

<div>
<label className="text-sm">Plan Amount</label>
<select
name="planAmount"
value={form.planAmount}
onChange={handleChange}
className="input"
>
<option value="">Select</option>
<option value="100000">₹1,00,000</option>
<option value="200000">₹2,00,000</option>
<option value="500000">₹5,00,000</option>
<option value="1000000">₹10,00,000</option>
</select>
</div>

</div>

<div className="grid grid-cols-2 gap-3">

<div>
<label className="text-sm">Cash Received</label>
<input
name="cashReceived"
value={form.cashReceived}
onChange={handleChange}
className="input"
/>
</div>

<div>
<label className="text-sm">Payment Type</label>
<select
name="paymentType"
value={form.paymentType}
onChange={handleChange}
className="input"
>
<option>Cash</option>
<option>UPI/GPAY/PhonePe</option>
</select>
</div>

</div>

<div className="grid grid-cols-2 gap-3">

<div>
<label className="text-sm">User Type</label>
<select
name="userType"
value={form.userType}
onChange={handleChange}
className="input"
>
<option>Chit User</option>
<option>Non-User</option>
</select>
</div>

<div>
<label className="text-sm">Collectable Name</label>
<input
name="agentName"
value={form.agentName}
onChange={handleChange}
className="input"
/>
</div>

</div>

<label className="text-sm">Notes</label>

<textarea
name="notes"
value={form.notes}
onChange={handleChange}
className="input h-20"
/>

<div className="flex gap-2 mt-2">

<button
type="button"
onClick={handleDownloadPDF}
className="btn-primary flex-1"
>

{loading?"Generating...":"Download PDF"}

</button>

<Button
variant="contained"
color="success"
startIcon={<WhatsAppIcon/>}
onClick={handleShareWhatsApp}
disabled={loading}
>

{loading?"Sharing...":"Share on WhatsApp"}

</Button>

</div>

</form>

</div>


{/* INVOICE PREVIEW */}

<div
ref={invoiceRef}
className="bg-white rounded-lg mt-4 p-6 w-full max-w-[794px]"
>

{/* Invoice Header */}

<div className="text-center mb-4">

<img src={logo} className="mx-auto w-24"/>

<h2 className="text-2xl font-bold">TRS Chit Fund</h2>

<p>2B,Chinnasamy Naidu street, Dharmapuri</p>
<p className="text-gray-600 text-sm">
Contact: Ramesh-9444545907 & Siva-7200120078
</p>
<div className="relative mt-2">

<h3 className="text-lg font-semibold text-center">
Payment Receipt
</h3>

<div className="absolute right-0 top-0 text-sm text-gray-600">
<h3 className="font-semibold text-center">{formatDateInput(form.date)}</h3>
</div>

</div>
</div>

{/* Invoice Data */}

<div className="grid grid-cols-2 gap-4 text-sm">

<div>
<div className="text-gray-500">Name</div>
<div className="font-bold">{form.customerName||"-"}</div>
</div>

<div>
<div className="text-gray-500">Chit Month</div>
<div className="font-bold">{form.chitNumber||"-"}</div>
</div>

<div>
<div className="text-gray-500">Plan</div>
<div>{form.planName||"-"}</div>
</div>

<div>
<div className="text-gray-500">Plan Amount</div>
<div>{getPlanLabel(form.planAmount)}</div>
</div>

<div>
<div className="text-gray-500">Cash Received</div>
<div>{formatCurrency(form.cashReceived)}</div>
</div>

<div>
<div className="text-gray-500">Payment Type</div>
<div>{form.paymentType}</div>
</div>

<div>
<div className="text-gray-500">User Type</div>
<div>{form.userType}</div>
</div>

<div>
<div className="text-gray-500">Collection Name</div>
<div>{form.agentName}</div>
</div>

</div>

{/* Notes */}

<div className="mt-4">
<div className="text-gray-500 text-sm">Notes</div>
<div>{form.notes}</div>
</div>

{/* Signature */}

<div className="mt-6 grid grid-cols-2">

<div>
<div className="text-gray-500">Receiver Signature</div>
<div className="mt-8">{form.customerName}</div>
</div>

<div className="text-right">

<div>For TRS Chit Fund</div>

<div className="mt-8 font-bold">{form.agentName}</div>

</div>

</div>

{/* Advertisement */}

<div className="mt-6 border-t pt-4">

<div className="text-gray-600 mb-2">

Advertisement Shop's / விளம்பரம் சேவை தொடர்பு கொள்ளுங்கள்:
<strong> 8778376526</strong>

</div>

<div className="w-full h-28 flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg">

<img src={adsImage} alt="ad" className="h-24 w-100 object-contain"/> 

</div>

</div>

</div>

</div>

<style jsx>{`

.input{
width:100%;
padding:8px;
border-radius:6px;
border:1px solid #e5e7eb;
}

.btn-primary{
background:#0ea5a4;
color:white;
padding:8px 12px;
border-radius:6px;
}

`}</style>

</div>

);

}