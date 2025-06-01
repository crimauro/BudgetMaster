using BudgetMaster.Application.DTOs.MonetaryFunds;
using BudgetMaster.Domain.Common;

namespace BudgetMaster.Application.Services
{
    public interface IMonetaryFundService
    {
        Task<Result<IEnumerable<MonetaryFundDto>>> GetAllAsync();
        Task<Result<MonetaryFundDto>> GetByIdAsync(int id);
        Task<Result<MonetaryFundDto>> CreateAsync(CreateMonetaryFundDto createDto);
        Task<Result<MonetaryFundDto>> UpdateAsync(int id, UpdateMonetaryFundDto updateDto);
        Task<Result<bool>> DeleteAsync(int id);
        Task<Result<decimal>> GetBalanceAsync(int id);
    }
}
