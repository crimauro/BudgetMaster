using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BudgetMaster.Application.Services;
using BudgetMaster.Application.DTOs.ExpenseTypes;
using BudgetMaster.Domain.Common;

namespace BudgetMaster.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExpenseTypesController : ControllerBase
    {
        private readonly IExpenseTypeService _expenseTypeService;

        public ExpenseTypesController(IExpenseTypeService expenseTypeService)
        {
            _expenseTypeService = expenseTypeService;
        }

        [HttpGet]
        public async Task<ActionResult<Result<IEnumerable<ExpenseTypeDto>>>> GetAll()
        {
            try
            {
                var result = await _expenseTypeService.GetAllAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<IEnumerable<ExpenseTypeDto>>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Result<ExpenseTypeDto>>> GetById(int id)
        {
            try
            {
                var result = await _expenseTypeService.GetByIdAsync(id);
                
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                
                return NotFound(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<ExpenseTypeDto>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpPost]
        public async Task<ActionResult<Result<ExpenseTypeDto>>> Create([FromBody] CreateExpenseTypeDto createExpenseTypeDto)
        {
            try
            {
                var result = await _expenseTypeService.CreateAsync(createExpenseTypeDto);
                
                if (result.IsSuccess)
                {
                    return CreatedAtAction(nameof(GetById), new { id = result.Data?.Id }, result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<ExpenseTypeDto>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }        [HttpPut("{id}")]
        public async Task<ActionResult<Result<ExpenseTypeDto>>> Update(int id, [FromBody] UpdateExpenseTypeDto updateExpenseTypeDto)
        {
            try
            {
                updateExpenseTypeDto.Id = id;
                var result = await _expenseTypeService.UpdateAsync(updateExpenseTypeDto);
                
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<ExpenseTypeDto>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Result<bool>>> Delete(int id)
        {
            try
            {
                var result = await _expenseTypeService.DeleteAsync(id);
                
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
