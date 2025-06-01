using Microsoft.EntityFrameworkCore;
using BudgetMaster.Domain.Entities;
using BudgetMaster.Domain.Interfaces;
using BudgetMaster.Infrastructure.Data;

namespace BudgetMaster.Infrastructure.Repositories
{
    public class ExpenseRecordRepository : Repository<ExpenseRecord>, IExpenseRecordRepository
    {
        public ExpenseRecordRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<ExpenseRecord>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _dbSet
                .Where(er => er.Date >= startDate && er.Date <= endDate && er.IsActive)
                .Include(er => er.MonetaryFund)
                .Include(er => er.ExpenseType)
                .Include(er => er.ExpenseDetails)
                .ThenInclude(ed => ed.ExpenseType)
                .ToListAsync();
        }

        public async Task<IEnumerable<ExpenseRecord>> GetByMonetaryFundAsync(int monetaryFundId)
        {
            return await _dbSet
                .Where(er => er.MonetaryFundId == monetaryFundId && er.IsActive)
                .Include(er => er.MonetaryFund)
                .Include(er => er.ExpenseType)
                .Include(er => er.ExpenseDetails)
                .ThenInclude(ed => ed.ExpenseType)
                .ToListAsync();
        }

        public async Task<IEnumerable<ExpenseRecord>> GetByExpenseTypeIdAsync(int expenseTypeId)
        {
            return await _dbSet
                .Where(er => er.ExpenseTypeId == expenseTypeId && er.IsActive)
                .Include(er => er.MonetaryFund)
                .Include(er => er.ExpenseType)
                .Include(er => er.ExpenseDetails)
                .ThenInclude(ed => ed.ExpenseType)
                .ToListAsync();
        }

        public async Task<IEnumerable<ExpenseRecord>> GetByMonetaryFundIdAsync(int monetaryFundId)
        {
            return await GetByMonetaryFundAsync(monetaryFundId);
        }

        public async Task<IEnumerable<ExpenseRecord>> GetByPeriodAsync(DateTime startDate, DateTime endDate)
        {
            return await GetByDateRangeAsync(startDate, endDate);
        }

        public async Task<decimal> GetTotalExpensesByTypeAndDateAsync(int expenseTypeId, DateTime startDate, DateTime endDate)
        {
            return await _dbSet
                .Where(er => er.ExpenseTypeId == expenseTypeId && 
                            er.Date >= startDate && 
                            er.Date <= endDate && 
                            er.IsActive)
                .SumAsync(er => er.TotalAmount);
        }

        public async Task<ExpenseRecord?> GetWithDetailsAsync(int id)
        {
            return await _dbSet
                .Where(er => er.Id == id && er.IsActive)
                .Include(er => er.MonetaryFund)
                .Include(er => er.ExpenseType)
                .Include(er => er.ExpenseDetails)
                .ThenInclude(ed => ed.ExpenseType)
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<ExpenseRecord>> GetByExpenseTypeAndPeriodAsync(int expenseTypeId, DateTime startDate, DateTime endDate)
        {
            return await _dbSet
                .Where(er => er.ExpenseTypeId == expenseTypeId && 
                            er.Date >= startDate && 
                            er.Date <= endDate && 
                            er.IsActive)
                .Include(er => er.MonetaryFund)
                .Include(er => er.ExpenseType)
                .Include(er => er.ExpenseDetails)
                .ThenInclude(ed => ed.ExpenseType)
                .ToListAsync();
        }

        public async Task<IEnumerable<ExpenseDetail>> GetExpenseDetailsAsync(int expenseRecordId)
        {
            return await _context.ExpenseDetails
                .Where(ed => ed.ExpenseRecordId == expenseRecordId && ed.IsActive)
                .Include(ed => ed.ExpenseType)
                .ToListAsync();
        }

        public async Task<ExpenseDetail> AddExpenseDetailAsync(ExpenseDetail expenseDetail)
        {
            expenseDetail.CreatedDate = DateTime.UtcNow;
            expenseDetail.IsActive = true;
            await _context.ExpenseDetails.AddAsync(expenseDetail);
            return expenseDetail;
        }

        public async Task<ExpenseDetail?> GetExpenseDetailByIdAsync(int expenseDetailId)
        {
            return await _context.ExpenseDetails
                .Where(ed => ed.Id == expenseDetailId && ed.IsActive)
                .Include(ed => ed.ExpenseType)
                .FirstOrDefaultAsync();
        }

        public async Task DeleteExpenseDetail(ExpenseDetail expenseDetail)
        {
            expenseDetail.IsActive = false;
            expenseDetail.ModifiedDate = DateTime.UtcNow;
            _context.ExpenseDetails.Update(expenseDetail);
            await Task.CompletedTask;
        }

        public async Task<bool> HasExpenseRecordsForFundAsync(int monetaryFundId)
        {
            return await _dbSet.AnyAsync(er => er.MonetaryFundId == monetaryFundId && er.IsActive);
        }

        public async Task<IEnumerable<ExpenseRecord>> GetByUserIdAsync(int userId)
        {
            return await _dbSet
                .Where(er => er.UserId == userId && er.IsActive)
                .Include(er => er.MonetaryFund)
                .Include(er => er.ExpenseType)
                .Include(er => er.ExpenseDetails)
                .ThenInclude(ed => ed.ExpenseType)
                .OrderByDescending(er => er.Date)
                .ToListAsync();
        }
    }
}
