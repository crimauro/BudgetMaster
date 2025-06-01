using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BudgetMaster.Application.Services;
using BudgetMaster.Application.DTOs.Deposits;
using BudgetMaster.Domain.Common;

namespace BudgetMaster.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DepositsController : ControllerBase
    {
        private readonly IDepositService _depositService;

        public DepositsController(IDepositService depositService)
        {
            _depositService = depositService;
        }

        [HttpGet]
        public async Task<ActionResult<Result<IEnumerable<DepositDto>>>> GetAll([FromQuery] int? monetaryFundId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                Result<IEnumerable<DepositDto>> result;

                if (monetaryFundId.HasValue && startDate.HasValue && endDate.HasValue)
                {
                    result = await _depositService.GetByMonetaryFundAndPeriodAsync(monetaryFundId.Value, startDate.Value, endDate.Value);
                }
                else if (monetaryFundId.HasValue)
                {
                    result = await _depositService.GetByMonetaryFundIdAsync(monetaryFundId.Value);
                }
                else if (startDate.HasValue && endDate.HasValue)
                {
                    result = await _depositService.GetByPeriodAsync(startDate.Value, endDate.Value);
                }
                else
                {
                    result = await _depositService.GetAllAsync();
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<IEnumerable<DepositDto>>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Result<DepositDto>>> GetById(int id)
        {
            try
            {
                var result = await _depositService.GetByIdAsync(id);
                
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                
                return NotFound(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<DepositDto>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpPost]
        public async Task<ActionResult<Result<DepositDto>>> Create([FromBody] CreateDepositDto createDepositDto)
        {
            try
            {
                var result = await _depositService.CreateAsync(createDepositDto);
                
                if (result.IsSuccess)
                {
                    return CreatedAtAction(nameof(GetById), new { id = result.Data?.Id }, result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<DepositDto>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Result<DepositDto>>> Update(int id, [FromBody] UpdateDepositDto updateDepositDto)
        {
            try
            {
                var result = await _depositService.UpdateAsync(id, updateDepositDto);
                
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<DepositDto>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Result<bool>>> Delete(int id)
        {
            try
            {
                var result = await _depositService.DeleteAsync(id);
                
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
