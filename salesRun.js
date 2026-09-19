const { buildSalesPlan } = require("./salesAgent");

async function runSales() {
  const prospects = `
1. Comfort Crew Heating & Cooling
Columbus
Website: https://comfortcrewohio.com/
Phone: (614) 202-6061
Public signal: advertises 24/7 service and emergency response.

2. SuperTec Heating & Cooling
Columbus
Website: https://supertechvac.com/
Phone: (614) 595-9251
Public signal: offers free phone consultations and 24/7 emergency service.

3. 3 Brothers Heating & Cooling
Columbus
Website: https://3brothersheatingcooling.com/
Phone: (614) 948-8972
Public signal: newer family-operated company serving a broad Central Ohio area.

4. 614 OH HVAC
Columbus
Website: https://614ohhvac.com/
Phone: (614) 618-4399
Public signal: promotes same-day service, 24-hour emergency response, free quotes, and a website quote form.

5. All Hours Mechanical
Columbus area
Website: https://allhourshvac.com/
Phone: (614) 567-7100
Public signal: advertises 24/7/365 availability and commercial HVAC/refrigeration service.
`;

  console.log("\n=== BUILDING SALES PLAN ===\n");

  const salesPlan = await buildSalesPlan(prospects);

  console.log("\n=== SALES PLAN ===\n");
  console.log(salesPlan);
}

runSales();