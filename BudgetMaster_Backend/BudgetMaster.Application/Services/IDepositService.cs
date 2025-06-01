using BudgetMaster.Application.DTOs.Deposits;
using BudgetMaster.Domain.Common;

namespace BudgetMaster.Application.Services
{
    public interface IDepositService
    {
        Task<Result<IEnumerable<DepositDto>>> GetAllAsync();
        Task<Result<DepositDto>> GetByIdAsync(int id);
        Task<Result<IEnumerable<DepositDto>>> GetByMonetaryFundIdAsync(int monetaryFundId);
        Task<Result<IEnumerable<DepositDto>>> GetByPeriodAsync(DateTime startDate, DateTime endDate);
        Task<Result<DepositDto>> CreateAsync(CreateDepositDto createDto);
        Task<Result<DepositDto>> UpdateAsync(int id, UpdateDepositDto updateDto);
        Task<Result<bool>> DeleteAsync(int id);
        Task<Result<decimal>> GetTotalAmountByMonetaryFundAsync(int monetaryFundId);
        Task<Result<decimal>> GetTotalAmountByPeriodAsync(DateTime startDate, DateTime endDate);
        Task<Result<IEnumerable<DepositDto>>> GetByMonetaryFundAndPeriodAsync(int monetaryFundId, DateTime startDate, DateTime endDate);
    }
}
