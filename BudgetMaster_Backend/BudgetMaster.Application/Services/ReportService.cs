using AutoMapper;
using BudgetMaster.Application.DTOs.Reports;
using BudgetMaster.Domain.Interfaces;
using BudgetMaster.Domain.Common;

namespace BudgetMaster.Application.Services
{
    public class ReportService : IReportService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ReportService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }        public async Task<Result<BudgetVsExecutionReportDto>> GetBudgetVsExecutionReportAsync(int userId, int month, int year)
        {
            try
            {
                var startDate = new DateTime(year, month, 1);
                var endDate = startDate.AddMonths(1).AddDays(-1);

                var report = new BudgetVsExecutionReportDto
                {
                    StartDate = startDate,
                    EndDate = endDate,
                    GeneratedAt = DateTime.UtcNow,
                    Items = new List<BudgetVsExecutionItemDto>()
                };

                // Obtener presupuestos del usuario para el mes específico
                var budgets = await _unitOfWork.Budgets.GetByUserAndMonthAsync(userId, month, year);

                foreach (var budget in budgets)
                {
                    // Obtener gastos ejecutados para este presupuesto
                    var expenses = await _unitOfWork.ExpenseRecords.GetByExpenseTypeAndPeriodAsync(
                        budget.ExpenseTypeId, budget.StartDate, budget.EndDate);

                    var executedAmount = expenses.Sum(e => e.Amount);
                    var remainingAmount = budget.Amount - executedAmount;
                    var executionPercentage = budget.Amount > 0 ? (executedAmount / budget.Amount) * 100 : 0;

                    var item = new BudgetVsExecutionItemDto
                    {
                        BudgetId = budget.Id,
                        ExpenseTypeId = budget.ExpenseTypeId,
                        ExpenseTypeName = budget.ExpenseType?.Name ?? "Tipo de gasto no encontrado",
                        BudgetAmount = budget.Amount,
                        ExecutedAmount = executedAmount,
                        RemainingAmount = remainingAmount,
                        ExecutionPercentage = Math.Round(executionPercentage, 2),
                        BudgetStartDate = budget.StartDate,
                        BudgetEndDate = budget.EndDate
                    };

                    report.Items.Add(item);
                }

                // Calcular totales
                report.TotalBudgeted = report.Items.Sum(i => i.BudgetAmount);
                report.TotalExecuted = report.Items.Sum(i => i.ExecutedAmount);
                report.TotalRemaining = report.Items.Sum(i => i.RemainingAmount);
                report.OverallExecutionPercentage = report.TotalBudgeted > 0 
                    ? Math.Round((report.TotalExecuted / report.TotalBudgeted) * 100, 2) 
                    : 0;

                return Result<BudgetVsExecutionReportDto>.Success(report);
            }
            catch (Exception ex)
            {
                return Result<BudgetVsExecutionReportDto>.Failure($"Error al generar el reporte de presupuesto vs ejecución: {ex.Message}");
            }
        }

        public async Task<Result<ExpensesByTypeReportDto>> GetExpensesByTypeReportAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                var report = new ExpensesByTypeReportDto
                {
                    StartDate = startDate,
                    EndDate = endDate,
                    GeneratedAt = DateTime.UtcNow,
                    Items = new List<ExpensesByTypeItemDto>()
                };

                // Obtener todos los tipos de gasto
                var expenseTypes = await _unitOfWork.ExpenseTypes.GetAllAsync();

                foreach (var expenseType in expenseTypes)
                {
                    // Obtener gastos por tipo en el período
                    var expenses = await _unitOfWork.ExpenseRecords.GetByExpenseTypeAndPeriodAsync(
                        expenseType.Id, startDate, endDate);

                    if (expenses.Any())
                    {
                        var item = new ExpensesByTypeItemDto
                        {
                            ExpenseTypeId = expenseType.Id,
                            ExpenseTypeName = expenseType.Name,
                            TotalAmount = expenses.Sum(e => e.Amount),
                            TransactionCount = expenses.Count(),
                            AverageAmount = Math.Round(expenses.Average(e => e.Amount), 2)
                        };

                        report.Items.Add(item);
                    }
                }

                // Calcular totales y porcentajes
                report.TotalAmount = report.Items.Sum(i => i.TotalAmount);
                
                foreach (var item in report.Items)
                {
                    item.Percentage = report.TotalAmount > 0 
                        ? Math.Round((item.TotalAmount / report.TotalAmount) * 100, 2) 
                        : 0;
                }

                // Ordenar por monto descendente
                report.Items = report.Items.OrderByDescending(i => i.TotalAmount).ToList();

                return Result<ExpensesByTypeReportDto>.Success(report);
            }
            catch (Exception ex)
            {
                return Result<ExpensesByTypeReportDto>.Failure($"Error al generar el reporte de gastos por tipo: {ex.Message}");
            }
        }

        public async Task<Result<MonthlyExpenseReportDto>> GetMonthlyExpenseReportAsync(int year)
        {
            try
            {
                var report = new MonthlyExpenseReportDto
                {
                    Year = year,
                    GeneratedAt = DateTime.UtcNow,
                    MonthlyData = new List<MonthlyExpenseDataDto>()
                };

                for (int month = 1; month <= 12; month++)
                {
                    var startDate = new DateTime(year, month, 1);
                    var endDate = startDate.AddMonths(1).AddDays(-1);

                    var expenses = await _unitOfWork.ExpenseRecords.GetByPeriodAsync(startDate, endDate);
                    var deposits = await _unitOfWork.Deposits.GetByPeriodAsync(startDate, endDate);

                    var monthlyData = new MonthlyExpenseDataDto
                    {
                        Month = month,
                        MonthName = startDate.ToString("MMMM"),
                        TotalExpenses = expenses.Sum(e => e.Amount),
                        TotalDeposits = deposits.Sum(d => d.Amount),
                        ExpenseCount = expenses.Count(),
                        DepositCount = deposits.Count()
                    };

                    monthlyData.NetAmount = monthlyData.TotalDeposits - monthlyData.TotalExpenses;
                    report.MonthlyData.Add(monthlyData);
                }

                // Calcular totales anuales
                report.TotalYearExpenses = report.MonthlyData.Sum(m => m.TotalExpenses);
                report.TotalYearDeposits = report.MonthlyData.Sum(m => m.TotalDeposits);
                report.NetYearAmount = report.TotalYearDeposits - report.TotalYearExpenses;
                report.AverageMonthlyExpenses = Math.Round(report.TotalYearExpenses / 12, 2);

                return Result<MonthlyExpenseReportDto>.Success(report);
            }
            catch (Exception ex)
            {
                return Result<MonthlyExpenseReportDto>.Failure($"Error al generar el reporte mensual de gastos: {ex.Message}");
            }
        }

        public async Task<Result<MonetaryFundBalanceReportDto>> GetMonetaryFundBalanceReportAsync()
        {
            try
            {
                var report = new MonetaryFundBalanceReportDto
                {
                    GeneratedAt = DateTime.UtcNow,
                    FundBalances = new List<MonetaryFundBalanceItemDto>()
                };

                var monetaryFunds = await _unitOfWork.MonetaryFunds.GetAllAsync();

                foreach (var fund in monetaryFunds)
                {
                    var deposits = await _unitOfWork.Deposits.GetByMonetaryFundIdAsync(fund.Id);
                    var expenses = await _unitOfWork.ExpenseRecords.GetByMonetaryFundIdAsync(fund.Id);

                    var totalDeposits = deposits.Sum(d => d.Amount);
                    var totalExpenses = expenses.Sum(e => e.Amount);
                    var currentBalance = totalDeposits - totalExpenses;

                    var lastDeposit = deposits.OrderByDescending(d => d.Date).FirstOrDefault();
                    var lastExpense = expenses.OrderByDescending(e => e.Date).FirstOrDefault();

                    var balanceItem = new MonetaryFundBalanceItemDto
                    {
                        MonetaryFundId = fund.Id,
                        MonetaryFundName = fund.Name,
                        TotalDeposits = totalDeposits,
                        TotalExpenses = totalExpenses,
                        CurrentBalance = currentBalance,
                        TransactionCount = deposits.Count() + expenses.Count(),
                        LastTransactionDate = new DateTime[] 
                        { 
                            lastDeposit?.Date ?? DateTime.MinValue, 
                            lastExpense?.Date ?? DateTime.MinValue 
                        }.Max()
                    };

                    if (balanceItem.LastTransactionDate == DateTime.MinValue)
                        balanceItem.LastTransactionDate = null;

                    report.FundBalances.Add(balanceItem);
                }

                // Calcular totales generales
                report.TotalDeposits = report.FundBalances.Sum(f => f.TotalDeposits);
                report.TotalExpenses = report.FundBalances.Sum(f => f.TotalExpenses);
                report.TotalBalance = report.FundBalances.Sum(f => f.CurrentBalance);

                // Ordenar por balance descendente
                report.FundBalances = report.FundBalances.OrderByDescending(f => f.CurrentBalance).ToList();

                return Result<MonetaryFundBalanceReportDto>.Success(report);
            }
            catch (Exception ex)
            {
                return Result<MonetaryFundBalanceReportDto>.Failure($"Error al generar el reporte de balance de fondos: {ex.Message}");
            }
        }

        public async Task<Result<MovementQueryReportDto>> GetMovementQueryReportAsync(MovementQueryFilterDto filter)
        {
            try
            {
                var report = new MovementQueryReportDto
                {
                    Filter = filter,
                    GeneratedAt = DateTime.UtcNow,
                    Movements = new List<MovementItemDto>()
                };

                // Obtener depósitos según filtros
                var deposits = await _unitOfWork.Deposits.GetAllAsync();
                if (filter.MonetaryFundId.HasValue)
                    deposits = deposits.Where(d => d.MonetaryFundId == filter.MonetaryFundId.Value);
                if (filter.StartDate.HasValue)
                    deposits = deposits.Where(d => d.Date >= filter.StartDate.Value);
                if (filter.EndDate.HasValue)
                    deposits = deposits.Where(d => d.Date <= filter.EndDate.Value);
                if (filter.MinAmount.HasValue)
                    deposits = deposits.Where(d => d.Amount >= filter.MinAmount.Value);
                if (filter.MaxAmount.HasValue)
                    deposits = deposits.Where(d => d.Amount <= filter.MaxAmount.Value);

                // Agregar depósitos al reporte
                foreach (var deposit in deposits)
                {
                    var movement = new MovementItemDto
                    {
                        Id = deposit.Id,
                        Type = "Depósito",
                        Date = deposit.Date,
                        Amount = deposit.Amount,
                        Description = deposit.Description ?? "",
                        MonetaryFundId = deposit.MonetaryFundId,
                        MonetaryFundName = deposit.MonetaryFund?.Name ?? "Fondo no encontrado",
                        ExpenseTypeId = null,
                        ExpenseTypeName = null
                    };
                    report.Movements.Add(movement);
                }

                // Obtener gastos según filtros
                var expenses = await _unitOfWork.ExpenseRecords.GetAllAsync();
                if (filter.MonetaryFundId.HasValue)
                    expenses = expenses.Where(e => e.MonetaryFundId == filter.MonetaryFundId.Value);
                if (filter.ExpenseTypeId.HasValue)
                    expenses = expenses.Where(e => e.ExpenseTypeId == filter.ExpenseTypeId.Value);
                if (filter.StartDate.HasValue)
                    expenses = expenses.Where(e => e.Date >= filter.StartDate.Value);
                if (filter.EndDate.HasValue)
                    expenses = expenses.Where(e => e.Date <= filter.EndDate.Value);
                if (filter.MinAmount.HasValue)
                    expenses = expenses.Where(e => e.Amount >= filter.MinAmount.Value);
                if (filter.MaxAmount.HasValue)
                    expenses = expenses.Where(e => e.Amount <= filter.MaxAmount.Value);

                // Agregar gastos al reporte
                foreach (var expense in expenses)
                {
                    var movement = new MovementItemDto
                    {
                        Id = expense.Id,
                        Type = "Gasto",
                        Date = expense.Date,
                        Amount = -expense.Amount, // Negativo para gastos
                        Description = expense.Description ?? "",
                        MonetaryFundId = expense.MonetaryFundId,
                        MonetaryFundName = expense.MonetaryFund?.Name ?? "Fondo no encontrado",
                        ExpenseTypeId = expense.ExpenseTypeId,
                        ExpenseTypeName = expense.ExpenseType?.Name ?? "Tipo no encontrado"
                    };
                    report.Movements.Add(movement);
                }

                // Ordenar por fecha descendente
                report.Movements = report.Movements.OrderByDescending(m => m.Date).ToList();

                // Calcular estadísticas
                var totalDeposits = report.Movements.Where(m => m.Type == "Depósito").Sum(m => m.Amount);
                var totalExpenses = Math.Abs(report.Movements.Where(m => m.Type == "Gasto").Sum(m => m.Amount));
                
                report.TotalDeposits = totalDeposits;
                report.TotalExpenses = totalExpenses;
                report.NetAmount = totalDeposits - totalExpenses;
                report.MovementCount = report.Movements.Count;

                return Result<MovementQueryReportDto>.Success(report);
            }
            catch (Exception ex)
            {
                return Result<MovementQueryReportDto>.Failure($"Error al generar el reporte de consulta de movimientos: {ex.Message}");
            }
        }

        public async Task<Result<ExpenseSummaryReportDto>> GetExpenseSummaryReportAsync(int userId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null)
                    return Result<ExpenseSummaryReportDto>.Failure("Usuario no encontrado");

                var expenses = await _unitOfWork.ExpenseRecords.GetByUserIdAsync(userId);
                expenses = expenses.Where(e => e.Date >= startDate && e.Date <= endDate).ToList();

                var deposits = await _unitOfWork.Deposits.GetByUserIdAsync(userId);
                deposits = deposits.Where(d => d.Date >= startDate && d.Date <= endDate).ToList();

                var report = new ExpenseSummaryReportDto
                {
                    UserId = userId,
                    UserName = user.Username,
                    StartDate = startDate,
                    EndDate = endDate,
                    TotalExpenses = expenses.Sum(e => e.Amount),
                    TotalDeposits = deposits.Sum(d => d.Amount),
                    NetMovement = deposits.Sum(d => d.Amount) - expenses.Sum(e => e.Amount)
                };

                return Result<ExpenseSummaryReportDto>.Success(report);
            }
            catch (Exception ex)
            {
                return Result<ExpenseSummaryReportDto>.Failure($"Error al generar resumen de gastos: {ex.Message}");
            }
        }

        public async Task<Result<MonthlyFinancialSummaryDto>> GetMonthlyFinancialSummaryAsync(int userId, int month, int year)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null)
                    return Result<MonthlyFinancialSummaryDto>.Failure("Usuario no encontrado");

                var budgets = await _unitOfWork.Budgets.GetByUserAndMonthAsync(userId, month, year);
                var startDate = new DateTime(year, month, 1);
                var endDate = startDate.AddMonths(1).AddDays(-1);

                var expenses = await _unitOfWork.ExpenseRecords.GetByUserIdAsync(userId);
                expenses = expenses.Where(e => e.Date >= startDate && e.Date <= endDate).ToList();

                var deposits = await _unitOfWork.Deposits.GetByUserIdAsync(userId);
                deposits = deposits.Where(d => d.Date >= startDate && d.Date <= endDate).ToList();

                var report = new MonthlyFinancialSummaryDto
                {
                    UserId = userId,
                    UserName = user.Username,
                    Month = month,
                    Year = year,
                    MonthName = startDate.ToString("MMMM"),
                    TotalBudgeted = budgets.Sum(b => b.Amount),
                    TotalSpent = expenses.Sum(e => e.Amount),
                    TotalDeposited = deposits.Sum(d => d.Amount)
                };

                report.BudgetVariance = report.TotalBudgeted - report.TotalSpent;
                report.BudgetUtilizationPercentage = report.TotalBudgeted > 0 ? (report.TotalSpent / report.TotalBudgeted) * 100 : 0;

                return Result<MonthlyFinancialSummaryDto>.Success(report);
            }
            catch (Exception ex)
            {
                return Result<MonthlyFinancialSummaryDto>.Failure($"Error al generar resumen financiero mensual: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<MovementDto>>> GetMovementsByUserAndPeriodAsync(int userId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var movements = new List<MovementDto>();

                var expenses = await _unitOfWork.ExpenseRecords.GetByUserIdAsync(userId);
                expenses = expenses.Where(e => e.Date >= startDate && e.Date <= endDate).ToList();

                var deposits = await _unitOfWork.Deposits.GetByUserIdAsync(userId);
                deposits = deposits.Where(d => d.Date >= startDate && d.Date <= endDate).ToList();

                // Agregar gastos
                foreach (var expense in expenses)
                {
                    movements.Add(new MovementDto
                    {
                        Id = expense.Id,
                        Date = expense.Date,
                        Description = expense.Description ?? "",
                        Amount = -expense.Amount, // Negativo para gastos
                        Type = "Expense",
                        MonetaryFundName = expense.MonetaryFund?.Name ?? "",
                        ExpenseTypeName = expense.ExpenseType?.Name,
                        ExpenseTypeCode = expense.ExpenseType?.Code,
                        UserName = expense.User?.Username ?? ""
                    });
                }

                // Agregar depósitos
                foreach (var deposit in deposits)
                {
                    movements.Add(new MovementDto
                    {
                        Id = deposit.Id,
                        Date = deposit.Date,
                        Description = deposit.Description ?? "",
                        Amount = deposit.Amount, // Positivo para depósitos
                        Type = "Deposit",
                        MonetaryFundName = deposit.MonetaryFund?.Name ?? "",
                        UserName = deposit.User?.Username ?? ""
                    });
                }

                return Result<IEnumerable<MovementDto>>.Success(movements.OrderByDescending(m => m.Date));
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<MovementDto>>.Failure($"Error al obtener movimientos por usuario: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<MovementDto>>> GetMovementsByMonetaryFundAndPeriodAsync(int monetaryFundId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var movements = new List<MovementDto>();

                var expenses = await _unitOfWork.ExpenseRecords.GetByMonetaryFundIdAsync(monetaryFundId);
                expenses = expenses.Where(e => e.Date >= startDate && e.Date <= endDate).ToList();

                var deposits = await _unitOfWork.Deposits.GetByMonetaryFundIdAsync(monetaryFundId);
                deposits = deposits.Where(d => d.Date >= startDate && d.Date <= endDate).ToList();

                // Agregar gastos
                foreach (var expense in expenses)
                {
                    movements.Add(new MovementDto
                    {
                        Id = expense.Id,
                        Date = expense.Date,
                        Description = expense.Description ?? "",
                        Amount = -expense.Amount, // Negativo para gastos
                        Type = "Expense",
                        MonetaryFundName = expense.MonetaryFund?.Name ?? "",
                        ExpenseTypeName = expense.ExpenseType?.Name,
                        ExpenseTypeCode = expense.ExpenseType?.Code,
                        UserName = expense.User?.Username ?? ""
                    });
                }

                // Agregar depósitos
                foreach (var deposit in deposits)
                {
                    movements.Add(new MovementDto
                    {
                        Id = deposit.Id,
                        Date = deposit.Date,
                        Description = deposit.Description ?? "",
                        Amount = deposit.Amount, // Positivo para depósitos
                        Type = "Deposit",
                        MonetaryFundName = deposit.MonetaryFund?.Name ?? "",
                        UserName = deposit.User?.Username ?? ""
                    });
                }

                return Result<IEnumerable<MovementDto>>.Success(movements.OrderByDescending(m => m.Date));
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<MovementDto>>.Failure($"Error al obtener movimientos por fondo monetario: {ex.Message}");
            }
        }
    }
}
