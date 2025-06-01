using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BudgetMaster.Application.Services;
using BudgetMaster.Application.DTOs.Reports;
using BudgetMaster.Domain.Common;

namespace BudgetMaster.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("budget-vs-execution")]
        public async Task<ActionResult<Result<BudgetVsExecutionReportDto>>> GetBudgetVsExecutionReport([FromQuery] int userId, [FromQuery] int month, [FromQuery] int year)
        {
            try
            {
                var result = await _reportService.GetBudgetVsExecutionReportAsync(userId, month, year);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<BudgetVsExecutionReportDto>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpGet("expense-summary")]
        public async Task<ActionResult<Result<ExpenseSummaryReportDto>>> GetExpenseSummaryReport([FromQuery] int userId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                var result = await _reportService.GetExpenseSummaryReportAsync(userId, startDate, endDate);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<ExpenseSummaryReportDto>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpGet("monthly-summary")]
        public async Task<ActionResult<Result<MonthlyFinancialSummaryDto>>> GetMonthlySummary([FromQuery] int userId, [FromQuery] int month, [FromQuery] int year)
        {
            try
            {
                var result = await _reportService.GetMonthlyFinancialSummaryAsync(userId, month, year);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<MonthlyFinancialSummaryDto>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpGet("movements")]
        public async Task<ActionResult<Result<IEnumerable<MovementDto>>>> GetMovements([FromQuery] int? userId, [FromQuery] int? monetaryFundId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                Result<IEnumerable<MovementDto>> result;

                if (userId.HasValue && startDate.HasValue && endDate.HasValue)
                {
                    result = await _reportService.GetMovementsByUserAndPeriodAsync(userId.Value, startDate.Value, endDate.Value);
                }
                else if (monetaryFundId.HasValue && startDate.HasValue && endDate.HasValue)
                {
                    result = await _reportService.GetMovementsByMonetaryFundAndPeriodAsync(monetaryFundId.Value, startDate.Value, endDate.Value);
                }
                else
                {
                    return BadRequest(Result<IEnumerable<MovementDto>>.Failure("Debe especificar userId o monetaryFundId junto con startDate y endDate"));
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<IEnumerable<MovementDto>>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }
    }
}
