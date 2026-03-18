import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Chart from 'chart.js/auto';


const createChartImage = async (type, data, options) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 300;
    
    canvas.style.position = 'absolute';
    canvas.style.top = '-9999px';
    document.body.appendChild(canvas);
    
    const config = {
      type,
      data,
      options: {
        ...options,
        animation: false,
        devicePixelRatio: 2, 
        plugins: {
          ...options?.plugins,
          legend: {
            labels: { font: { family: 'Helvetica' } }
          }
        }
      }
    };
    
    const chart = new Chart(canvas, config);
    
    setTimeout(() => {
      const img = chart.toBase64Image();
      chart.destroy();
      document.body.removeChild(canvas);
      resolve(img);
    }, 100);
  });
};

export const generateThreatReport = async (user, allThreats) => {
  try {
    
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    
    const recentThreats = allThreats.filter(t => new Date(t.createdAt) >= fifteenDaysAgo).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    
    const total = recentThreats.length;
    const frauds = recentThreats.filter(t => t.isFraud).length;
    const safe = total - frauds;
    
    
    
    let userScore = 100;
    if (total > 0) {
      userScore = Math.max(10, Math.round((safe / total) * 100));
    }
    
    let scoreText = '';
    if (userScore >= 80) scoreText = "Excellent - You are safely navigating the digital landscape.";
    else if (userScore >= 50) scoreText = "Moderate Risk - Be careful of the links you click and files you download.";
    else scoreText = "High Risk - You frequently encounter malicious content. Exercise extreme caution!";

    const inputTypes = recentThreats.reduce((acc, curr) => {
      acc[curr.inputType] = (acc[curr.inputType] || 0) + 1;
      return acc;
    }, {});

    
    const pieChartImg = await createChartImage('pie', {
      labels: ['Safe Scans', 'Fraud Detected'],
      datasets: [{
        data: [safe, frauds],
        backgroundColor: ['#10B981', '#EF4444'],
        borderWidth: 1
      }]
    }, { responsive: false });

    
    const labels = Object.keys(inputTypes);
    const dataVals = Object.values(inputTypes);
    const barChartImg = await createChartImage('bar', {
      labels: labels.length ? labels : ['None'],
      datasets: [{
        label: 'Scans by Input Type',
        data: dataVals.length ? dataVals : [0],
        backgroundColor: '#6366F1'
      }]
    }, { 
      responsive: false,
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    });

    
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 0;

    
    const addHeaderBanner = () => {
      
      doc.setFillColor(30, 27, 75); 
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.text("NoFraud", 15, 20);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.setTextColor(165, 180, 252); 
      doc.text("Personal Threat Intelligence Report", 15, 28);
      
      
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 15, 20, { align: "right" });
      doc.text(`Window: Last 15 Days`, pageWidth - 15, 26, { align: "right" });
    };

    const addSectionHeader = (title, y) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59); 
      doc.text(title, 15, y);
      
      
      doc.setDrawColor(226, 232, 240); 
      doc.setLineWidth(0.5);
      doc.line(15, y + 2, pageWidth - 15, y + 2);
      return y + 10;
    };

    
    addHeaderBanner();
    yPos = 50;
    
    
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105); 
    doc.setFont("helvetica", "normal");
    const name = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Valued User';
    doc.text(`Prepared exclusively for: ${name}`, 15, yPos);
    yPos += 10;

    
    doc.setFillColor(userScore >= 80 ? 236 : userScore >= 50 ? 254 : 254, 
                     userScore >= 80 ? 253 : userScore >= 50 ? 240 : 226, 
                     userScore >= 80 ? 245 : userScore >= 50 ? 138 : 226); 
                     
    doc.roundedRect(15, yPos, pageWidth - 30, 30, 4, 4, 'F');
    
    
    doc.setFontSize(36);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(userScore >= 80 ? 5 : userScore >= 50 ? 161 : 220, 
                     userScore >= 80 ? 150 : userScore >= 50 ? 98 : 38, 
                     userScore >= 80 ? 105 : userScore >= 50 ? 7 : 38); 
    doc.text(`${userScore}`, 25, yPos + 22);
    
    doc.setFontSize(12);
    doc.text("/ 100", 45 + (userScore === 100 ? 5 : 0), yPos + 22); 
    
    
    doc.setFontSize(14);
    doc.text("Security Posture", 90, yPos + 10);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    let wrapScoreText = doc.splitTextToSize(scoreText, pageWidth - 110);
    doc.text(wrapScoreText, 90, yPos + 18);
    
    yPos += 40;

    
    const cardW = (pageWidth - 40) / 3;
    
    
    doc.setFillColor(248, 250, 252); 
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, yPos, cardW, 20, 3, 3, 'FD');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text(`${total}`, 15 + (cardW/2), yPos + 10, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Total Scans", 15 + (cardW/2), yPos + 16, { align: 'center' });

    
    doc.setFillColor(236, 253, 245); 
    doc.setDrawColor(167, 243, 208); 
    doc.roundedRect(15 + cardW + 5, yPos, cardW, 20, 3, 3, 'FD');
    doc.setFontSize(18);
    doc.setTextColor(16, 185, 129); 
    doc.text(`${safe}`, 15 + cardW + 5 + (cardW/2), yPos + 10, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(6, 78, 59); 
    doc.text("Safe Items", 15 + cardW + 5 + (cardW/2), yPos + 16, { align: 'center' });

    
    doc.setFillColor(254, 242, 242); 
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(15 + (cardW*2) + 10, yPos, cardW, 20, 3, 3, 'FD');
    doc.setFontSize(18);
    doc.setTextColor(239, 68, 68); 
    doc.text(`${frauds}`, 15 + (cardW*2) + 10 + (cardW/2), yPos + 10, { align: 'center' });
    doc.setFontSize(9);
    doc.text("Threats Blocked", 15 + (cardW*2) + 10 + (cardW/2), yPos + 16, { align: 'center' });

    yPos += 30;

    
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, yPos, pageWidth - 30, 65, 4, 4, 'F');
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(" Proactive Security Posture", 20, yPos + 10);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const practices = [
      "1. Enable Two-Factor Authentication (2FA) on all critical accounts (banking, emails).",
      "2. Verify sender addresses meticulously; do not trust display names alone.",
      "3. Never download or execute unexpected attachments (.exe, .zip, .pdf).",
      "4. View urgent payment or password-reset requests with extreme skepticism.",
      "5. Consult NoFraud's deep analysis before interacting with unknown links.",
      "6. Use long, unique passphrases stored in a secure password manager.",
    ];
    
    let pY = yPos + 18;
    practices.forEach(p => {
      doc.text(p, 20, pY);
      pY += 7;
    });

    
    doc.addPage();
    addHeaderBanner();
    yPos = 45;

    
    yPos = addSectionHeader("Threat Landscape", yPos);
    
    
    const chartW = (pageWidth - 40) / 2;
    
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    
    
    doc.roundedRect(15, yPos, chartW, 55, 3, 3, 'FD');
    doc.addImage(pieChartImg, 'PNG', 15 + (chartW/2) - 30, yPos + 5, 60, 40); 
    
    
    doc.roundedRect(15 + chartW + 10, yPos, chartW, 55, 3, 3, 'FD');
    doc.addImage(barChartImg, 'PNG', 15 + chartW + 10 + (chartW/2) - 35, yPos + 5, 70, 40); 

    yPos += 65;
    
    yPos = addSectionHeader("Detailed Threat Log", yPos);

    
    const tableBody = recentThreats.map(t => {
      const date = new Date(t.createdAt).toLocaleDateString();
      const status = t.isFraud ? 'FRAUD' : 'SAFE';
      const content = t.content.length > 50 ? t.content.substring(0, 50) + '...' : t.content;
      
      let nextStepsStr = "";
      if (t.isFraud && t.nextSteps && t.nextSteps.length > 0) {
        nextStepsStr = "• " + t.nextSteps.join("\n• ");
      }
      return [date, t.inputType.toUpperCase(), status, content, t.explanation, nextStepsStr];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Type', 'Status', 'Content Scanned', 'AI Context', 'Action Plan']],
      body: tableBody,
      theme: 'grid',
      headStyles: { 
        fillColor: [30, 27, 75], // slate-950
        textColor: 255, 
        fontStyle: 'bold',
        fontSize: 9 // Slightly smaller for fit
      },
      styles: { 
        fontSize: 7.5, // Reduced font to prevent wrapping
        cellPadding: 3, 
        font: 'helvetica',
        textColor: [71, 85, 105], // slate-600
        overflow: 'linebreak'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // slate-50
      },
      columnStyles: {
        0: { cellWidth: 18 }, // Date
        1: { cellWidth: 15 }, // Type
        2: { cellWidth: 15, fontStyle: 'bold' }, // Status
        3: { cellWidth: 50 }, // Content (wider)
        4: { cellWidth: 90 }, // Context (much wider for landscape)
        5: { cellWidth: 70 }  // Action (wider for landscape)
      },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 2) {
          if (data.cell.raw === 'FRAUD') {
            data.cell.styles.textColor = [220, 38, 38]; // Red
          } else {
            data.cell.styles.textColor = [16, 185, 129]; // Green
          }
        }
      }
    });

    // --- PAGE 3: Footer/Helplines ---
    yPos = doc.lastAutoTable.finalY + 10;
    
    // Check if we need a page break for the footer (height 35)
    if (yPos > pageHeight - 40) {
       doc.addPage();
       addHeaderBanner();
       yPos = 45;
    }

    doc.setFillColor(254, 242, 242); // red-50
    doc.setDrawColor(254, 202, 202); // red-200
    doc.roundedRect(15, yPos, pageWidth - 30, 35, 4, 4, 'FD');
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38); 
    doc.text(" Report Cyber Crime (India Helpdesk)", 20, yPos + 8);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text("• National Helpline Level 1: 1930", 20, yPos + 16);
    doc.text("• Official Gov Portal: https://cybercrime.gov.in/", 20, yPos + 22);
    doc.text("• Phishing Incident Response: incident@cert-in.org.in", 20, yPos + 28);

    
    doc.save('NoFraud_Threat_Intelligence.pdf');
    return true;

  } catch (err) {
    
    throw err; 
  }
};
