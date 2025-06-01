using Microsoft.EntityFrameworkCore;
using BudgetMaster.Domain.Entities;
using BudgetMaster.Domain.Interfaces;
using BudgetMaster.Infrastructure.Data;

namespace BudgetMaster.Infrastructure.Repositories
{    public class ExpenseTypeRepository : Repository<ExpenseType>, IExpenseTypeRepository
    {
        public ExpenseTypeRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<bool> ExistsByNameAsync(string name)
        {
            return await _dbSet.AnyAsync(et => et.Name == name && et.IsActive);
        }

        public async Task<ExpenseType?> GetByNameAsync(string name)
        {
            return await _dbSet.FirstOrDefaultAsync(et => et.Name == name && et.IsActive);
        }

        public async Task<string> GetNextCodeAsync()
        {
            var lastCode = await _dbSet
                .Where(et => et.Code.StartsWith("ET"))
                .OrderByDescending(et => et.Code)
                .Select(et => et.Code)
                .FirstOrDefaultAsync();

            if (string.IsNullOrEmpty(lastCode))
                return "ET001";

            var numberPart = lastCode.Substring(2);
            if (int.TryParse(numberPart, out int number))
            {
                return $"ET{(number + 1):D3}";
            }

            return "ET001";
        }

        public async Task<bool> CodeExistsAsync(string code)
        {
            return await _dbSet.AnyAsync(et => et.Code == code);
        }
    }
}
