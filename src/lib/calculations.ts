import type { AmortizationRow } from "./types";

/**
 * Calculate Canadian-style amortization schedule
 * Uses monthly compounding (standard in Canada for variable-rate consumer loans)
 */
export function calculateAmortization(
  principal: number,
  annualRate: number,
  termMonths: number,
  startDate: Date = new Date()
): AmortizationRow[] {
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  const schedule: AmortizationRow[] = [];
  let balance = principal;

  for (let i = 1; i <= termMonths; i++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance = Math.max(0, balance - principalPayment);

    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + i);

    schedule.push({
      payment_number: i,
      date: paymentDate.toISOString().split("T")[0],
      payment: Math.round(monthlyPayment * 100) / 100,
      principal: Math.round(principalPayment * 100) / 100,
      interest: Math.round(interestPayment * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    });
  }

  return schedule;
}

/**
 * Calculate monthly payment amount
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);
  return Math.round(payment * 100) / 100;
}

/**
 * Calculate total cost of borrowing (Canadian disclosure requirement)
 */
export function calculateTotalCost(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths);
  return Math.round(monthlyPayment * termMonths * 100) / 100;
}

/**
 * Calculate Debt-to-Income ratio
 */
export function calculateDTI(
  monthlyDebtPayments: number,
  monthlyGrossIncome: number
): number {
  if (monthlyGrossIncome <= 0) return 100;
  return Math.round((monthlyDebtPayments / monthlyGrossIncome) * 100 * 100) / 100;
}

/**
 * Calculate EduKard Score (proprietary algorithm)
 * Score: 0-100, higher is better
 */
export function calculateEduKardScore(params: {
  monthlyIncome: number;
  employmentMonths: number;
  requestedAmount: number;
  termMonths: number;
}): { score: number; riskFlag: "green" | "yellow" | "red"; approvedLimit: number } {
  const { monthlyIncome, employmentMonths, requestedAmount, termMonths } = params;

  // Factor 1: Income stability (0-30 points)
  const incomeScore = Math.min(30, (employmentMonths / 12) * 10);

  // Factor 2: Affordability (0-40 points)
  const monthlyPayment = calculateMonthlyPayment(requestedAmount, 12, termMonths);
  const dti = calculateDTI(monthlyPayment, monthlyIncome);
  const affordabilityScore = dti < 20 ? 40 : dti < 30 ? 30 : dti < 40 ? 20 : dti < 50 ? 10 : 0;

  // Factor 3: Income level (0-30 points)
  const incomeLevel = Math.min(30, (monthlyIncome / 5000) * 30);

  const totalScore = Math.round(incomeScore + affordabilityScore + incomeLevel);

  // Risk classification
  let riskFlag: "green" | "yellow" | "red";
  if (totalScore >= 65) riskFlag = "green";
  else if (totalScore >= 40) riskFlag = "yellow";
  else riskFlag = "red";

  // Approved limit based on income (max 6 months gross income)
  const maxLimit = monthlyIncome * 6;
  const approvedLimit = riskFlag === "red" ? 0 : Math.min(requestedAmount, maxLimit);

  return { score: totalScore, riskFlag, approvedLimit: Math.round(approvedLimit) };
}

/**
 * Calculate yield accrual for investor
 */
export function calculateAccruedYield(
  principal: number,
  annualRate: number,
  daysSinceInvestment: number
): number {
  const dailyRate = annualRate / 100 / 365;
  return Math.round(principal * dailyRate * daysSinceInvestment * 100) / 100;
}

/**
 * Format CAD currency
 */
export function formatCAD(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Format Canadian date
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
