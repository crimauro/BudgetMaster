using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BudgetMaster.Application.Services;
using BudgetMaster.Application.DTOs.ExpenseRecords;
using BudgetMaster.Domain.Common;

namespace BudgetMaster.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExpenseRecordsController : ControllerBase
    {
        private readonly IExpenseRecordService _expenseRecordService;

        public ExpenseRecordsController(IExpenseRecordService expenseRecordService)
        {
            _expenseRecordService = expenseRecordService;
        }

        [HttpGet]
        public async Task<ActionResult<Result<IEnumerable<ExpenseRecordDto>>>> GetAll([FromQuery] int? userId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                Result<IEnumerable<ExpenseRecordDto>> result;

                if (startDate.HasValue && endDate.HasValue)
                {
                    result = await _expenseRecordService.GetByPeriodAsync(startDate.Value, endDate.Value);
                }
                else if (userId.HasValue)
                {
                    result = await _expenseRecordService.GetByUserIdAsync(userId.Value);
                }
                else
                {
                    result = await _expenseRecordService.GetAllAsync();
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<IEnumerable<ExpenseRecordDto>>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Result<ExpenseRecordDto>>> GetById(int id)
        {
            try
            {
                var result = await _expenseRecordService.GetByIdAsync(id);
                
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                
                return NotFound(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<ExpenseRecordDto>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpGet("{id}/details")]
        public async Task<ActionResult<Result<IEnumerable<ExpenseDetailDto>>>> GetDetails(int id)
        {
            try
            {
                var result = await _expenseRecordService.GetExpenseDetailsAsync(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<IEnumerable<ExpenseDetailDto>>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpPost]
        public async Task<ActionResult<Result<ExpenseRecordDto>>> Create([FromBody] CreateExpenseRecordDto createExpenseRecordDto)
        {
            try
            {
                var result = await _expenseRecordService.CreateAsync(createExpenseRecordDto);
                
                if (result.IsSuccess)
                {
                    return CreatedAtAction(nameof(GetById), new { id = result.Data?.Id }, result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<ExpenseRecordDto>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpPost("{id}/details")]
        public async Task<ActionResult<Result<ExpenseDetailDto>>> AddDetail(int id, [FromBody] CreateExpenseDetailDto createExpenseDetailDto)
        {
            try
            {
                var result = await _expenseRecordService.AddExpenseDetailAsync(id, createExpenseDetailDto);
                
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<ExpenseDetailDto>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Result<ExpenseRecordDto>>> Update(int id, [FromBody] UpdateExpenseRecordDto updateExpenseRecordDto)
        {
            try
            {
                var result = await _expenseRecordService.UpdateAsync(id, updateExpenseRecordDto);
                
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<ExpenseRecordDto>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Result<bool>>> Delete(int id)
        {
            try
            {
                var result = await _expenseRecordService.DeleteAsync(id);
                
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<bool>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpDelete("{expenseRecordId}/details/{detailId}")]
        public async Task<ActionResult<Result<bool>>> RemoveDetail(int expenseRecordId, int detailId)
        {
            try
            {
                var result = await _expenseRecordService.RemoveExpenseDetailAsync(detailId);
                
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<bool>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }
    }
}
