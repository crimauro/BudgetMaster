using BudgetMaster.Application.DTOs.Reports;
using BudgetMaster.Domain.Common;

namespace BudgetMaster.Application.Services
{    public interface IReportService
    {
        Task<Result<BudgetVsExecutionReportDto>> GetBudgetVsExecutionReportAsync(int userId, int month, int year);
        Task<Result<ExpensesByTypeReportDto>> GetExpensesByTypeReportAsync(DateTime startDate, DateTime endDate);
        Task<Result<ExpenseSummaryReportDto>> GetExpenseSummaryReportAsync(int userId, DateTime startDate, DateTime endDate);
        Task<Result<MonthlyExpenseReportDto>> GetMonthlyExpenseReportAsync(int year);
        Task<Result<MonthlyFinancialSummaryDto>> GetMonthlyFinancialSummaryAsync(int userId, int month, int year);
        Task<Result<MonetaryFundBalanceReportDto>> GetMonetaryFundBalanceReportAsync();
        Task<Result<MovementQueryReportDto>> GetMovementQueryReportAsync(MovementQueryFilterDto filter);
        Task<Result<IEnumerable<MovementDto>>> GetMovementsByUserAndPeriodAsync(int userId, DateTime startDate, DateTime endDate);
        Task<Result<IEnumerable<MovementDto>>> GetMovementsByMonetaryFundAndPeriodAsync(int monetaryFundId, DateTime startDate, DateTime endDate);
    }
}
