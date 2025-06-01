using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BudgetMaster.Application.Services;
using BudgetMaster.Application.DTOs.MonetaryFunds;
using BudgetMaster.Domain.Common;

namespace BudgetMaster.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MonetaryFundsController : ControllerBase
    {
        private readonly IMonetaryFundService _monetaryFundService;

        public MonetaryFundsController(IMonetaryFundService monetaryFundService)
        {
            _monetaryFundService = monetaryFundService;
        }

        [HttpGet]
        public async Task<ActionResult<Result<IEnumerable<MonetaryFundDto>>>> GetAll()
        {
            try
            {
                var result = await _monetaryFundService.GetAllAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<IEnumerable<MonetaryFundDto>>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Result<MonetaryFundDto>>> GetById(int id)
        {
            try
            {
                var result = await _monetaryFundService.GetByIdAsync(id);
                
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                
                return NotFound(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<MonetaryFundDto>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpGet("{id}/balance")]
        public async Task<ActionResult<Result<decimal>>> GetBalance(int id)
        {
            try
            {
                var result = await _monetaryFundService.GetBalanceAsync(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<decimal>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpPost]
        public async Task<ActionResult<Result<MonetaryFundDto>>> Create([FromBody] CreateMonetaryFundDto createMonetaryFundDto)
        {
            try
            {
                var result = await _monetaryFundService.CreateAsync(createMonetaryFundDto);
                
                if (result.IsSuccess)
                {
                    return CreatedAtAction(nameof(GetById), new { id = result.Data?.Id }, result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<MonetaryFundDto>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Result<MonetaryFundDto>>> Update(int id, [FromBody] UpdateMonetaryFundDto updateMonetaryFundDto)
        {
            try
            {
                var result = await _monetaryFundService.UpdateAsync(id, updateMonetaryFundDto);
                
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, Result<MonetaryFundDto>.Failure($"Error interno del servidor: {ex.Message}"));
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Result<bool>>> Delete(int id)
        {
            try
            {
                var result = await _monetaryFundService.DeleteAsync(id);
                
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
