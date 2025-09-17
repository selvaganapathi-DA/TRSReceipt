import React, { useState, useRef } from "react";
import logo from './Logo.png'
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./invoice.css"; // custom styles (see below)

export default function ChitFundInvoice() {
  // Form state to hold all input values
  const [form, setForm] = useState({
    customerName: "",
    date: new Date().toISOString().slice(0, 10),
    chitNumber: "",
    planName: "",
    planAmount: "",
    cashReceived: "₹",
    paymentType: "Cash",
    agentName: "",
    userType: "Chit User",
    notes: "Nil",
    signature :"Ramesh.T"
  });
  
const signatureRef = useRef(null);

const [loading,setLoading] = useState(false);
const invoiceRef = useRef(null);

  // Generic input handler
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }



  // Format currency (INR)
function formatCurrency(val) {
  if (!val) return "-";
  const n = Number(val);
  if (Number.isNaN(n)) return val;
  return n.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

// Get Plan Amount Label for Invoice
function getPlanLabel(val) {
  const plans = {
    "100000": "1,00,000",
    "200000": "2,00,000",
    "500000": "5,00,000",
    "1000000": "10,00,000",
  };
  return plans[val] || "-";
}
// ✅ Generate PDF (always single A4 page, mobile + desktop)


  //download PDF
// async function handleDownloadPDF() {
//   const pdf = await generatePDF();
//     pdf.save(`chitfund_invoice_${form.customerName || "customer"}.pdf`);
  
//   // Share via WhatsApp
//   async function handleShareWhatsApp() {
//   const pdf = await generatePDF();
//   const pdfBlob = pdf.output("blob");
//   const pdfFile = new File([pdfBlob], "ChitFund_Invoice.pdf", {
//     type: "application/pdf",
//   });

//   if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
//     try {
//       await navigator.share({
//         title: "Chit Fund Invoice",
//         text: "Here is your receipt from TRS Chit Fund",
//         files: [pdfFile],
//       });
//     } catch (err) {
//       console.error("Share failed:", err);
//     }
//   } else {
//     // ✅ WhatsApp Fallback
//     const url = URL.createObjectURL(pdfBlob);
//     window.open(`https://wa.me/?text=Here is your Chit Fund Invoice: ${url}`);
//   }
// }
// -- generatePDF: create a jsPDF instance and fit the invoice to full A4 width (no side gaps)
async function generatePDF() {
  const input = invoiceRef.current;
  if (!input) throw new Error("invoiceRef is empty");

  // use devicePixelRatio for better quality on mobile
  const scale = Math.max(2, window.devicePixelRatio || 1);

  const canvas = await html2canvas(input, {
    scale,
    useCORS: true,
    scrollX: 0,
    scrollY: -window.scrollY, // capture visible layout correctly
    windowWidth: document.documentElement.clientWidth,
    windowHeight: document.documentElement.clientHeight,
    allowTaint: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // compute scaled height while forcing full width (no left/right gaps)
  const imgProps = pdf.getImageProperties(imgData);
  const imgHeightMm = (imgProps.height * pdfWidth) / imgProps.width;
  const finalHeight = imgHeightMm > pdfHeight ? pdfHeight : imgHeightMm;

  // put top-left at 0,0 so it fills horizontally
  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, finalHeight,imgHeightMm);

  return pdf;
}

// -- Download (forces download via blob -> anchor click)
async function handleDownloadPDF() {
  setLoading(true);
  try {
    const pdf = await generatePDF();
    const blob = pdf.output("blob");
    const filename = `chitfund_invoice_${(form.customerName || "customer").replace(/\s+/g, "_")}.pdf`;

    // create anchor and force download (works reliably across browsers)
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    // revoke after a bit
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch (err) {
    console.error("Download PDF failed:", err);
    alert("Could not download PDF — check console for details.");
  } finally {
    setLoading(false);
  }
}

// -- Share via WhatsApp (Web Share API if files supported; otherwise open PDF in new tab + open WA text)
async function handleShareWhatsApp() {
  setLoading(true);
  try {
    const pdf = await generatePDF();
    const blob = pdf.output("blob");
    const filename = `chitfund_invoice_${(form.customerName || "customer").replace(/\s+/g, "_")}.pdf`;
    const file = new File([blob], filename, { type: "application/pdf" });

    // ✅ Case 1: Mobile browsers that support file share
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "Chit Fund Invoice",
        text: "Here is your Chit Fund Invoice from TRS Chit Fund.",
      });
      return;
    }

    // ❌ Case 2: Fallback (desktop or unsupported mobile)
    // Auto-download the file
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    // Open WhatsApp with a text
    const text = encodeURIComponent(
      "Invoice generated ✅. The PDF has been downloaded — please attach it here."
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");

    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch (err) {
    console.error("WhatsApp share failed:", err);
    alert("Could not share to WhatsApp — PDF downloaded instead.");
  } finally {
    setLoading(false);
  }
}




  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-4 text-center">
          {/* Company Logo */}
          <img src = {logo} alt="Company Logo" className="h-20 w-20 object-contain mb-2" />
          <h1 className="text-2xl font-bold">TRS Chit Fund</h1>
          <p className="text-gray-600 text-sm">2B, ChinnaSamy Naidu Street, Dharmapuri-636701, Tamil Nadu</p>
          <p className="text-gray-600 text-sm">Contact: Ramesh- +91 9444545907 & Siva-7200120078</p>
          {/* <div className="mt-2 text-xs text-gray-500">Responsive • Mobile-first Invoice Generator</div> */}
        </div>

        {/* Form + Actions */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4">
            <form className="grid grid-cols-1 gap-3">
              {/* Customer Name */}
              <label className="text-sm">Name</label>
              <input name="customerName" value={form.customerName} onChange={handleChange} className="input" placeholder="Customer full name" />

              {/* Date & Chit No */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Date</label>
                  <input name="date" type="date" value={form.date} onChange={handleChange} className="input" />
                </div>
                <div>
                  <label className="text-sm">Month</label>
                  <input name="chitNumber" value={form.chitNumber} onChange={handleChange} className="input" placeholder="001" />
                </div>
              </div>

              {/* Plan */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Plan Name</label>
                  <input name="planName" value={form.planName} onChange={handleChange} className="input" placeholder="Monthly Plan" />
                </div>
                <div>
                  <label className="text-sm">Plan Amount</label>
                <select name="planAmount" value={form.planAmount} onChange={handleChange} className="input">
                  <option value="select">Chit Plan</option>                    
                  <option value="100000">₹1,00,000</option>
                  <option value="200000">₹2,00,000</option>
                  <option value="500000">₹5,00,000</option>
                  <option value="1000000">₹10,00,000</option>
                </select>
                </div>
              </div>

              {/* Payment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Cash Received</label>
                  <input name="cashReceived" value={form.cashReceived} onChange={handleChange} className="input" placeholder="₹" inputMode="numeric" />
                </div>
                <div>
                  <label className="text-sm">Payment Type</label>
                  <select name="paymentType" value={form.paymentType} onChange={handleChange} className="input">
                    <option>Cash</option>
                    <option>UPI/GPAY/PhonePe</option>
                  </select>
                </div>
              </div>

              {/* User & Agent */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">User Type</label>
                  <select name="userType" value={form.userType} onChange={handleChange} className="input">
                    <option>Chit User</option>
                    <option>Non-User</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm">Collectable Name </label>
                  <input name="agentName" value={form.agentName} onChange={handleChange} className="input" placeholder="Name" />
                </div>
              </div>

              {/* Notes */}
              <label className="text-sm">Notes (optional)</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} className="input h-20" placeholder="Any remarks or payment reference" />

              {/* Actions */}
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={handleDownloadPDF} className="btn-primary flex-1">{loading ? "Generating..." : "Download PDF"}
</button>
                <button type="button" onClick={handleShareWhatsApp} className="btn-outline">{loading ? "Preparing..." : "Share via WhatsApp"}
</button>
              </div>

            
            </form>
          </div>

          {/* Invoice Preview */}
          {/* <div ref={invoiceRef} className="bg-white p-4 rounded-lg shadow-sm print:shadow-none"> */}
   <div 
  ref={invoiceRef} 
  id="invoice-preview" 
  className="invoice-container bg-white rounded-lg w-full sm:w-[794px] sm:min-h-[1123px] mx-auto print:shadow-none 
             px-4 sm:px-7 py-6 sm:py-8 
            max-w-[794px] mx-auto"
>

  <div className="border-t p-1 bg-gray-50 print:bg-white">
            <div className="bg-white p-1 rounded-lg shadow-sm print:shadow-none">
              {/* Company Header in Invoice */}
              <div className="text-center mb-4">
                <img src={logo} alt="Company Logo" className="h-21 w-20 mx-auto mb-0" />
                <h2 className="font-bold text-lg"><bold>TRS Chit Fund</bold></h2>
                <p className="text-xs text-gray-600">2B,Chinnasamy Naidu street, Dharmapuri-636701, Tamil Nadu</p>
                <p className="text-xs text-gray-600"><strong>Contact: Ramesh- +91-9444545907 & Siva - +91-7200120078</strong> </p>
              </div>

<div className="flex items-start justify-between mb-4">
  {/* Left Box - Receipt Title */}
  <div className="border-2 border-gray-100 rounded-lg px-4 py-2 bg-gray-50">
    <h2 className="font-bold text-lg text-center">Chit Payment Receipt</h2>
    <div className="text-xs text-gray-500 text-center"></div>
  </div>

  {/* Right Box - Date */}
  <div className="text-right text-sm ml-4">
    <div className="font-medium">Date</div>
    <div className="text-gray-700">{form.date}</div>
  </div>
</div>
            
              {/* Invoice Body */}
              {/* <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 text-xs">Name</div>
                  <div className="font-medium">{form.customerName || "-"}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Chit Number</div>
                  <div className="font-medium">{form.chitNumber || "-"}</div>
                </div>

                <div>
                  <div className="text-gray-500 text-xs">Plan</div>
                  <div className="font-medium">{form.planName || "-"}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Plan Amount</div>
                  <div className="font-medium">{getPlanLabel(form.planAmount)}</div>      
                </div>

                <div>
                  <div className="text-gray-500 text-xs">Cash Received</div>
                  <div className="font-medium">{formatCurrency(form.cashReceived)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Payment Type</div>
                  <div className="font-medium">{form.paymentType}</div>
                </div>

                <div>
                  <div className="text-gray-500 text-xs">User Type</div>
                  <div className="font-medium">{form.userType}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Collection Name</div>
                  <div className="font-medium">{form.agentName || "-"}</div>
                </div>
              </div> */}
<div className="mt-2 grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
  <div className="text-left">
    <div className="text-gray-500 text-xs">Name</div>
    <div className="font-semibold">{form.customerName || "-"}</div>
  </div>
  <div className="text-right">
    <div className="text-gray-500 text-xs">Chit Month</div>
    <div className="font-semibold">{form.chitNumber || "-"}</div>
  </div>

  <div className="text-left">
    <div className="text-gray-500 text-xs">Plan</div>
    <div className="font-semibold">{form.planName || "-"}</div>
  </div>
  <div className="text-right">
    <div className="text-gray-500 text-xs">Plan Amount</div>
    <div className="font-semibold">{getPlanLabel(form.planAmount)}</div>
  </div>

  <div className="text-left">
    <div className="text-gray-500 text-xs">Cash Received</div>
    <div className="font-semibold">{formatCurrency(form.cashReceived)}</div>
  </div>
  <div className="text-right">
    <div className="text-gray-500 text-xs">Payment Type</div>
    <div className="font-semibold">{form.paymentType}</div>
  </div>

  <div className="text-left">
    <div className="text-gray-500 text-xs">User Type</div>
    <div className="font-semibold">{form.userType}</div>
  </div>
  <div className="text-right">
    <div className="text-gray-500 text-xs">Collection Name</div>
    <div className="font-semibold">{form.agentName || "-"}</div>
  </div>
</div>

              {/* Notes */}
              <div className="mt-4 text-sm">
                <div className="text-gray-500 text-xs">Notes</div>
                <div className="font-medium">{form.notes || "-"}</div>
              </div>

              {/* Signature */}
              <div className="mt-6 grid grid-cols-2 gap-4 items-end">
                <div className="text-sm">
                  <div className="text-gray-500 text-xs">Receiver Signature</div>
                  <div ref={signatureRef} className="mt-6 h-14 border rounded-md flex items-center justify-center text-xs text-gray-400">
                    <p className="mt-2">{form.customerName || "-"}</p>
</div>
                </div>
                <div className="text-sm text-right">
                  <div className="text-gray-500 text-xs">For TRS Chit Fund</div>
                  <p className="mt-1">{form.agentName || "-"}</p>
                  <div className="font-medium mt-0">Authorized Signatory</div>
                </div>
              </div>
{/* 🔹 More Chit Plans Link */}
        <div className="text-center mb-6">
          <a
            href="https://selvaganapathi-da.github.io/CHIT_TRS/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline font-medium text-lg"
          >
          Chit Plans
          </a>
        </div>
        
              {/* <div className="mt-3 text-xs text-gray-400">This is a computer-generated receipt and doesn't require physical seal.</div> */}
             {/* 🔹 Footer Credit */}
        <div className="mt-4 text-center text-sm text-gray-500">
          Created & Developed by <span className="font-semibold">SELVAGANAPATHI R</span>
        </div>
        {/* 🔹 Advertisement Banner */}
        <div className="mt-4 border-t-2 border-gray-300 pt-4">
          <div className="w-full h-28 flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg">
            <span className="text-gray-500 text-lg">
              Contact Advertisement Our Shop's/Business
            </span>
          </div>
        </div>
            </div>
          </div>
        </div>

</div>
        
        {/* Tips */}
        {/* <div className="mt-4 text-sm text-gray-600">
          <div className="mb-1">Tips: Use the Print button on mobile to save as PDF or directly print via connected printer. Use WhatsApp share to send the invoice text quickly.</div>
        </div> */}
        
      </div>

      {/* Inline styles for inputs and buttons */}
      <style jsx>{`
        .input{ width:100%; padding:0.5rem; border-radius:0.5rem; border:1px solid #e5e7eb; }
        .btn-primary{ background:#0ea5a4; color:white; padding:0.5rem 0.75rem; border-radius:0.5rem; }
        .btn-outline{ background:white; border:1px solid #cbd5e1; padding:0.5rem 0.75rem; border-radius:0.5rem; }
        .btn-ghost{ background:transparent; border:1px dashed #cbd5e1; padding:0.45rem 0.6rem; border-radius:0.5rem; }
        @media print {
          body * { visibility: visible; }
          #invoice-preview {
 width: 210mm;
    height: 297mm;
   margin: 0;
    padding: 0;
    border: none;
    box-shadow: none;
  } , #invoice-preview * { padding-left: 5%;
  padding-right: 5%; visibility: visible; }
          form, .btn-primary, .btn-outline, .btn-ghost { display:none !important; }
          @page { size: A4; margin: 12mm; }

        }
      `}</style>
    </div>
  );
}
 