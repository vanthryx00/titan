// Print and export helper utilities for Pay Stubs and Tax reports

export const printPayStub = (stub) => {
  const printWindow = window.open('', '_blank', 'width=850,height=900');
  if (!printWindow) {
    alert('Please allow popups to print pay stub');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Pay Stub - ${stub.artistName} - ${stub.id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1e293b; background: #fff; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 3px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; margin: 0; }
          .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
          .stub-id { text-align: right; }
          .stub-id h2 { margin: 0; font-size: 20px; color: #e11d48; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #e2e8f0; }
          .meta-item { font-size: 14px; }
          .meta-label { font-weight: 600; color: #475569; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          th { background: #0f172a; color: #fff; text-align: left; padding: 10px 12px; font-size: 13px; text-transform: uppercase; }
          td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
          .amount { text-align: right; font-family: monospace; font-size: 14px; }
          .total-box { background: #0f172a; color: #fff; padding: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
          .total-box h3 { margin: 0; font-size: 18px; }
          .total-box .net-amount { font-size: 28px; font-weight: 800; color: #38bdf8; }
          .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">Shane's Tattoo Studio LLC</h1>
            <div class="subtitle">1084 Boulevard of Arts, Suite 400 • EIN: XX-XXX8492 • Phone: (555) 742-6378</div>
          </div>
          <div class="stub-id">
            <h2>EARNINGS STATEMENT</h2>
            <div class="subtitle">Reference: ${stub.id}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div>
            <div class="meta-item"><span class="meta-label">Artist Name:</span> ${stub.artistName}</div>
            <div class="meta-item"><span class="meta-label">Position / Role:</span> ${stub.role}</div>
            <div class="meta-item"><span class="meta-label">Classification:</span> Form 1099 Independent Contractor</div>
          </div>
          <div>
            <div class="meta-item"><span class="meta-label">Pay Period:</span> ${stub.payPeriodStart} to ${stub.payPeriodEnd}</div>
            <div class="meta-item"><span class="meta-label">Payment Date:</span> ${stub.paymentDate}</div>
            <div class="meta-item"><span class="meta-label">Disbursement Method:</span> ${stub.payoutMethod}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Earnings Description</th>
              <th>Basis / Hours</th>
              <th>Rate / Split</th>
              <th style="text-align: right;">Gross Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tattoo Production (Artist Share)</td>
              <td>${stub.hoursWorked || 'N/A'} Hours</td>
              <td>${Math.round(stub.commissionRate * 100)}% of $${stub.grossTattooRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              <td class="amount">$${stub.artistTattooShare.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td>Client Tips (100% Passed Through)</td>
              <td>Direct Client Gratuities</td>
              <td>100.0%</td>
              <td class="amount">$${stub.totalTips.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>

        <table>
          <thead>
            <tr>
              <th>Itemized Deductions & Supplies</th>
              <th>Category</th>
              <th style="text-align: right;">Deduction Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Needle Cartridges, Disposables, Inks</td>
              <td>Shop Supply Allocation</td>
              <td class="amount">-$${stub.deductions?.suppliesDisposables?.toFixed(2) || '0.00'}</td>
            </tr>
            <tr>
              <td>Credit Card Merchant Processing Share</td>
              <td>Merchant Processing (2.9%)</td>
              <td class="amount">-$${stub.deductions?.ccProcessingShare?.toFixed(2) || '0.00'}</td>
            </tr>
            <tr>
              <td>Medical Sanitation & Autoclave Pouch Fee</td>
              <td>Biohazard / PPE</td>
              <td class="amount">-$${stub.deductions?.medicalSanitaryPouch?.toFixed(2) || '0.00'}</td>
            </tr>
            <tr style="background: #f1f5f9; font-weight: 700;">
              <td colspan="2">Total Deductions Subtotal</td>
              <td class="amount">-$${stub.totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>

        <div class="total-box">
          <div>
            <h3>NET PAYOUT ISSUED</h3>
            <div style="font-size: 13px; opacity: 0.8;">Status: ${stub.status.toUpperCase()}</div>
          </div>
          <div class="net-amount">$${stub.netPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>

        <div class="footer">
          Shane's Tattoo Studio LLC is a registered professional tattoo & body artistry enterprise.
          This statement is an official accounting record for tax preparation and 1099 reconciliation.
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 300);
};

export const printTaxSummary = (taxData) => {
  const printWindow = window.open('', '_blank', 'width=900,height=950');
  if (!printWindow) {
    alert('Please allow popups to export tax report');
    return;
  }

  const { summaryTotals, quarterlyTaxes1040ES, contractor1099List } = taxData;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Shane's Tattoo Studio - Annual Tax Packet (${taxData.currentYear})</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 35px; color: #0f172a; line-height: 1.5; }
          .header { border-bottom: 3px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; }
          .header h1 { margin: 0; font-size: 24px; color: #0f172a; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
          .card h3 { margin-top: 0; font-size: 15px; color: #475569; text-transform: uppercase; }
          .metric { font-size: 26px; font-weight: 800; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 25px; }
          th { background: #1e293b; color: white; text-align: left; padding: 8px 12px; font-size: 12px; }
          td { border-bottom: 1px solid #e2e8f0; padding: 8px 12px; font-size: 13px; }
          .num { text-align: right; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${taxData.businessLegalName}</h1>
          <div>Annual Business Tax & Revenue Statement • Tax Year: ${taxData.currentYear}</div>
          <div style="font-size: 12px; color: #64748b;">EIN: ${taxData.ein} • Entity: ${taxData.taxEntity}</div>
        </div>

        <div class="grid">
          <div class="card">
            <h3>Total Gross Revenue (YTD)</h3>
            <div class="metric" style="color: #059669;">$${summaryTotals.totalGrossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Tattoo Receipts + Merchandise</div>
          </div>
          <div class="card">
            <h3>Net Taxable Business Profit</h3>
            <div class="metric" style="color: #0284c7;">$${summaryTotals.netTaxableBusinessIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">After COGS & Schedule C Deductions</div>
          </div>
        </div>

        <h3 style="margin-bottom: 5px;">Schedule C (Form 1040) Deductions Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th>Expense Category / Line</th>
              <th class="num">Amount Deducted</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Cost of Goods Sold (Inks, Needles, Medical)</td><td class="num">$${summaryTotals.costOfGoodsSold.toLocaleString()}</td></tr>
            <tr><td>Line 11: Contract Labor (1099-NEC Artist Payouts)</td><td class="num">$${summaryTotals.deductions.contractLabor1099.toLocaleString()}</td></tr>
            <tr><td>Line 20: Studio Lease / Rent & Utilities</td><td class="num">$${(summaryTotals.deductions.studioLeaseRent + summaryTotals.deductions.utilitiesPowerWifiWater).toLocaleString()}</td></tr>
            <tr><td>Line 13: Machine & Autoclave Equipment Depreciation</td><td class="num">$${summaryTotals.deductions.depreciationMachinesAutoclave.toLocaleString()}</td></tr>
            <tr><td>Line 8: Advertising, Website Hosting & Promo Drops</td><td class="num">$${summaryTotals.deductions.advertisingSocialMarketing.toLocaleString()}</td></tr>
            <tr><td>Line 16: Liability Insurance, Biohazard Licensing</td><td class="num">$${(summaryTotals.deductions.businessInsuranceLiability + summaryTotals.deductions.legalLicensingBiohazardFees).toLocaleString()}</td></tr>
            <tr><td>Line 27: Merchant Processing & Sanitation</td><td class="num">$${(summaryTotals.deductions.merchantProcessingFees + summaryTotals.deductions.studioMaintenanceSanitation).toLocaleString()}</td></tr>
            <tr style="font-weight: 800; background: #f1f5f9;"><td>TOTAL ITEMIZE DEDUCTIONS</td><td class="num">$${summaryTotals.totalItemizedDeductions.toLocaleString()}</td></tr>
          </tbody>
        </table>

        <h3 style="margin-bottom: 5px;">Quarterly Estimated Taxes (Form 1040-ES)</h3>
        <table>
          <thead>
            <tr>
              <th>Quarter</th>
              <th>Due Date</th>
              <th class="num">Paid Amount</th>
              <th>Status</th>
              <th>Confirmation #</th>
            </tr>
          </thead>
          <tbody>
            ${quarterlyTaxes1040ES.map(q => `
              <tr>
                <td>${q.quarter}</td>
                <td>${q.quarter.split('(')[1]?.replace(')', '') || ''}</td>
                <td class="num">$${q.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td>${q.status}</td>
                <td>${q.confirmationNum || 'Pending'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3 style="margin-bottom: 5px;">1099-NEC Contractor Payout Summary</h3>
        <table>
          <thead>
            <tr>
              <th>Contractor Name</th>
              <th>Tax ID</th>
              <th class="num">Total 2026 Compensation</th>
              <th>W-9 File Status</th>
            </tr>
          </thead>
          <tbody>
            ${contractor1099List.map(c => `
              <tr>
                <td>${c.contractorName}</td>
                <td>${c.taxId}</td>
                <td class="num">$${c.compensationYTD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td>Verified Active</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 300);
};
