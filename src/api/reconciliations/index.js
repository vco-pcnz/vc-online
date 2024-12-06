import { request } from "@/utils/request";

export const getReconciliations = () => {
  return
}

export const getStatements = () => {
  const data = [
    { key: '01', date: '2003-04-12', client: 'John Brown',     spent: 32, received: 333, status: 'Unreconciled',  description: 'Legal Fee', },
    { key: '02', date: '2003-04-22', client: 'Jim Green',      spent: 42, received: 333, status: 'Unreconciled',  description: 'Broker Fee', },
    { key: '03', date: '2003-04-28', client: 'Joe Black',      spent: 32, received: 333, status: 'Unreconciled',  description: 'Drawdown', },
    { key: '04', date: '2003-05-02', client: 'Disabled User',  spent: 99, received: 333, status: 'Unreconciled',  description: 'Drawdown', },
    { key: '05', date: '2003-05-13', client: 'John Brown',     spent: 32, received: 333, status: 'Unreconciled',  description: 'Legal Fee', },
    { key: '06', date: '2003-05-20', client: 'Jim Green',      spent: 42, received: 333, status: 'Unreconciled',  description: 'Broker Fee', },
    { key: '07', date: '2003-05-22', client: 'Joe Black',      spent: 32, received: 333, status: 'Unreconciled',  description: 'Drawdown', },
    { key: '08', date: '2003-05-27', client: 'Disabled User',  spent: 99, received: 333, status: 'Unreconciled',  description: 'Drawdown', },
    { key: '09', date: '2003-05-30', client: 'John Brown',     spent: 32, received: 333, status: 'Reconciled',    description: 'Legal Fee', },
    { key: '10', date: '2003-06-02', client: 'Jim Green',      spent: 42, received: 333, status: 'Reconciled',    description: 'Broker Fee', },
    { key: '11', date: '2003-06-09', client: 'Joe Black',      spent: 32, received: 333, status: 'Reconciled',    description: 'Drawdown', },
    { key: '12', date: '2003-06-12', client: 'Disabled User',  spent: 99, received: 333, status: 'Reconciled',    description: 'Drawdown', },
    { key: '13', date: '2003-06-14', client: 'John Brown',     spent: 32, received: 333, status: 'Reconciled',    description: 'Legal Fee', },
    { key: '14', date: '2003-06-21', client: 'Jim Green',      spent: 42, received: 333, status: 'Reconciled',    description: 'Broker Fee', },
    { key: '15', date: '2003-06-25', client: 'Joe Black',      spent: 32, received: 333, status: 'Reconciled',    description: 'Drawdown', },
    { key: '16', date: '2003-06-27', client: 'Disabled User',  spent: 99, received: 333, status: 'Reconciled',    description: 'Drawdown', },
  ]
  return new Promise((resolve) => {
    resolve({
      data,
      count: data.length
    });
  })
}
  
export const getTransactions = () => {
  const data = [
    { key: '01', date: '2003-04-12', account: 'John Brown',     spent: 32, received: 333, status: 'Unreconciled',  notes: 'Legal Fee', },
    { key: '02', date: '2003-04-22', account: 'Jim Green',      spent: 42, received: 333, status: 'Unreconciled',  notes: 'Broker Fee', },
    { key: '03', date: '2003-04-28', account: 'Joe Black',      spent: 32, received: 333, status: 'Unreconciled',  notes: 'Drawdown', },
    { key: '04', date: '2003-05-02', account: 'Disabled User',  spent: 99, received: 333, status: 'Unreconciled',  notes: 'Drawdown', },
    { key: '05', date: '2003-05-13', account: 'John Brown',     spent: 32, received: 333, status: 'Unreconciled',  notes: 'Legal Fee', },
    { key: '06', date: '2003-05-20', account: 'Jim Green',      spent: 42, received: 333, status: 'Unreconciled',  notes: 'Broker Fee', },
    { key: '07', date: '2003-05-22', account: 'Joe Black',      spent: 32, received: 333, status: 'Unreconciled',  notes: 'Drawdown', },
    { key: '08', date: '2003-05-27', account: 'Disabled User',  spent: 99, received: 333, status: 'Unreconciled',  notes: 'Drawdown', },
    { key: '09', date: '2003-05-30', account: 'John Brown',     spent: 32, received: 333, status: 'Reconciled',    notes: 'Legal Fee', },
    { key: '10', date: '2003-06-02', account: 'Jim Green',      spent: 42, received: 333, status: 'Reconciled',    notes: 'Broker Fee', },
    { key: '11', date: '2003-06-09', account: 'Joe Black',      spent: 32, received: 333, status: 'Reconciled',    notes: 'Drawdown', },
    { key: '12', date: '2003-06-12', account: 'Disabled User',  spent: 99, received: 333, status: 'Reconciled',    notes: 'Drawdown', },
    { key: '13', date: '2003-06-14', account: 'John Brown',     spent: 32, received: 333, status: 'Reconciled',    notes: 'Legal Fee', },
    { key: '14', date: '2003-06-21', account: 'Jim Green',      spent: 42, received: 333, status: 'Reconciled',    notes: 'Broker Fee', },
    { key: '15', date: '2003-06-25', account: 'Joe Black',      spent: 32, received: 333, status: 'Reconciled',    notes: 'Drawdown', },
    { key: '16', date: '2003-06-27', account: 'Disabled User',  spent: 99, received: 333, status: 'Reconciled',    notes: 'Drawdown', },
  ];
  return new Promise((resolve) => {
    resolve({
      data,
      count: data.length
    });
  })
}
  