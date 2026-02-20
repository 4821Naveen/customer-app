
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function generateInvoice(order: any) {
    // Fetch latest company details
    const companyRes = await fetch('/api/settings/company');
    const company = companyRes.ok ? await companyRes.json() : {};

    const doc = new jsPDF();

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("TAX INVOICE", 14, 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Original for Recipient", 160, 22);

    // Separator line
    doc.setDrawColor(200);
    doc.line(14, 28, 196, 28);

    // Company (Seller) Details
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Sold By:", 14, 38);

    doc.setFontSize(14);
    doc.text(company.name || 'Company Name', 14, 45);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80);
    const addressLines = doc.splitTextToSize(company.address || '', 80);
    doc.text(addressLines, 14, 52);
    doc.text(`Mobile: ${company.mobile || ''}`, 14, 52 + (addressLines.length * 4));
    doc.setFont("helvetica", "bold");
    doc.text(`GSTIN: ${company.gstNumber || 'N/A'}`, 14, 52 + (addressLines.length * 4) + 5);

    // Invoice Meta (Right side)
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(`Invoice No:`, 130, 38);
    doc.setFont("helvetica", "bold");
    doc.text(`INV-${order.orderId}`, 160, 38);

    doc.setFont("helvetica", "normal");
    doc.text(`Invoice Date:`, 130, 44);
    doc.text(`${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 160, 44);

    doc.text(`Order ID:`, 130, 50);
    doc.text(`${order.orderId}`, 160, 50);

    // Customer (Buyer) Details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Bill To:", 14, 85);

    doc.setFontSize(11);
    doc.text(order.customer.name, 14, 92);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80);
    const custAddressLines = doc.splitTextToSize(order.customer.address || 'N/A', 80);
    doc.text(custAddressLines, 14, 98);
    doc.text(`Mobile: ${order.customer.mobile}`, 14, 98 + (custAddressLines.length * 4));

    // Table
    const tableColumn = ["S.No", "Description", "Qty", "Unit Price", "Tax (GST)", "Total"];
    const tableRows: any[] = [];

    order.products.forEach((p: any, index: number) => {
        const productData = [
            index + 1,
            p.name,
            p.quantity,
            `Rs ${p.price}`,
            `${p.gstRate || 0}%`,
            `Rs ${p.price * p.quantity}`,
        ];
        tableRows.push(productData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 120,
        theme: 'striped',
        headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
            0: { cellWidth: 15 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 15, halign: 'center' },
            3: { cellWidth: 30, halign: 'right' },
            4: { cellWidth: 25, halign: 'center' },
            5: { cellWidth: 30, halign: 'right' },
        }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // Summary
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Grand Total:`, 130, finalY);
    doc.setFontSize(14);
    doc.text(`Rs ${order.totalAmount.toLocaleString('en-IN')}`, 165, finalY);

    // Footer / Sign
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("This is a computer generated invoice and does not require a physical signature.", 14, finalY + 30);

    if (order.paymentStatus === 'refunded') {
        doc.setTextColor(255, 0, 0);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(`REFUNDED`, 14, finalY + 45);
    }

    doc.save(`Tax_Invoice_${order.orderId}.pdf`);
}
