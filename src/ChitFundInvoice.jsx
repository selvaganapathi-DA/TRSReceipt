import React, { useState, useRef } from "react";
import logo from './Logo.png'
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
async function generatePDF() {
  setLoading(true);
  const input = invoiceRef.current;

  const canvas = await html2canvas(input, {
    scale: 2,
    useCORS: true,
    scrollX: 0,
    scrollY: 0,
    windowWidth: input.scrollWidth,
    windowHeight: input.scrollHeight,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // Get image properties
  const imgWidth = imgProps.width;

  // Scale proportionally to fit A4
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const finalWidth = imgWidth * ratio;

   // Force full width (no left/right gap)
  const imgProps = pdf.getImageProperties(imgData);
  const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

  // If height is bigger than page, shrink to fit page height
  const finalHeight = imgHeight > pdfHeight ? pdfHeight : imgHeight;

  pdf.addImage(imgData, "PNG",0,0 , pdfWidth, finalHeight);

  setLoading(false);
  return pdf;
}


  //download PDF
async function handleDownloadPDF() {
  const pdf = await generatePDF();
    pdf.save(`chitfund_invoice_${form.customerName || "customer"}.pdf`);
  }



  // Share via WhatsApp
  async function handleShareWhatsApp() {
  const pdf = await generatePDF();
  const pdfBlob = pdf.output("blob");
  const pdfFile = new File([pdfBlob], "ChitFund_Invoice.pdf", {
    type: "application/pdf",
  });

  if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
    try {
      await navigator.share({
        title: "Chit Fund Invoice",
        text: "Here is your receipt from TRS Chit Fund",
        files: [pdfFile],
      });
    } catch (err) {
      console.error("Share failed:", err);
    }
  } else {
    // ✅ WhatsApp Fallback
    const url = URL.createObjectURL(pdfBlob);
    window.open(`https://wa.me/?text=Here is your Chit Fund Invoice: ${url}`);
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
                    <option>UPI</option>
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
  className="bg-white rounded-lg w-full sm:w-[794px] sm:min-h-[1123px] mx-auto print:shadow-none 
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

              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-lg">Customer Receipt</h2>
                  <div className="text-xs text-gray-500"></div>
                </div>
                <div className="text-right text-sm">
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
    <div className="text-gray-500 text-xs">Chit Number</div>
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

              <div className="mt-3 text-xs text-gray-400">This is a computer-generated receipt and doesn't require physical seal.</div>
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
 