export const calculateDebts = (expenses, participants) => {
  if (!participants || participants.length === 0) return [];
  const balances = {};
  participants.forEach(p => balances[p.id] = 0);

  expenses.forEach(exp => {
    if (!participants.find(p => p.id === exp.payerId)) return;
    const payerId = exp.payerId;
    const amount = parseFloat(exp.amount);
    
    const beneficiaryIds = exp.beneficiaryIds && exp.beneficiaryIds.length > 0 
      ? exp.beneficiaryIds 
      : participants.map(p => p.id);
    
    const weights = exp.splitWeights || {};
    const totalWeight = beneficiaryIds.reduce((sum, id) => sum + (parseFloat(weights[id]) || 1), 0);
    
    if (totalWeight > 0) {
      balances[payerId] += amount;
      beneficiaryIds.forEach(pId => {
        if (balances[pId] !== undefined) {
          const weight = parseFloat(weights[pId]) || 1;
          const userShare = (amount * weight) / totalWeight;
          balances[pId] -= userShare;
        }
      });
    }
  });

  let debtors = [], creditors = [];
  Object.keys(balances).forEach(id => {
    const amount = balances[id];
    if (amount < -1) debtors.push({ id: parseInt(id), amount });
    if (amount > 1) creditors.push({ id: parseInt(id), amount });
  });

  const transactions = [];
  debtors.sort((a, b) => a.amount - b.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(Math.abs(debtor.amount), creditor.amount);
    const fromPerson = participants.find(p => p.id === debtor.id);
    const toPerson = participants.find(p => p.id === creditor.id);

    if (fromPerson && toPerson) {
        transactions.push({ from: fromPerson, to: toPerson, amount: Math.round(amount) });
    }
    debtor.amount += amount;
    creditor.amount -= amount;
    if (Math.abs(debtor.amount) < 1) i++;
    if (creditor.amount < 1) j++;
  }
  return transactions;
};