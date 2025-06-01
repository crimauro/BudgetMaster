using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BudgetMaster.Application.Services;
using BudgetMaster.Application.DTOs.Budgets;
using BudgetMaster.Domain.Common;

namespace BudgetMaster.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BudgetsController : ControllerBase
    {
        private readonly IBudgetService _budgetService;

        public BudgetsController(IBudgetService budgetService)
        {
            _budgetService = budgetService;
        }

        [HttpGet]
        public async Task<ActionResult<Result<IEnumerable<BudgetDto>>>> GetAll([FromQuery] int? userId, [FromQuery] int? month, [FromQuery] int? year)
        {
            try
            {
                Result<IEnumerable<BudgetDto>> result;

                if (userId.HasValue && month.HasValue && year.HasValue)
                {
                    result = await _budgetService.GetByUserAndMonthAsync(userId.Value, month.Value, year.Value);
                }
                else if (userId.HasValue)
                {
                    result = await _budgetService.GetByUserIdAsync(userId.Value);
                }
                else
                {
                    result = await _budgetService.GetAllAsync();
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<IEnumerable<BudgetDto>>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Result<BudgetDto>>> GetById(int id)
        {
            try
            {
                var result = await _budgetService.GetByIdAsync(id);
                
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                
                return NotFound(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<BudgetDto>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpPost]
        public async Task<ActionResult<Result<BudgetDto>>> Create([FromBody] CreateBudgetDto createBudgetDto)
        {
            try
            {
                var result = await _budgetService.CreateAsync(createBudgetDto);
                
                if (result.IsSuccess)
                {
                    return CreatedAtAction(nameof(GetById), new { id = result.Data?.Id }, result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<BudgetDto>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Result<BudgetDto>>> Update(int id, [FromBody] UpdateBudgetDto updateBudgetDto)
        {
            try
            {
                var result = await _budgetService.UpdateAsync(id, updateBudgetDto);
                
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<BudgetDto>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Result<bool>>> Delete(int id)
        {
            try
            {
                var result = await _budgetService.DeleteAsync(id);
                
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
