using AutoMapper;
using BudgetMaster.Application.DTOs.MonetaryFunds;
using BudgetMaster.Domain.Entities;
using BudgetMaster.Domain.Interfaces;
using BudgetMaster.Domain.Common;

namespace BudgetMaster.Application.Services
{
    public class MonetaryFundService : IMonetaryFundService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public MonetaryFundService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<IEnumerable<MonetaryFundDto>>> GetAllAsync()
        {
            try
            {
                var funds = await _unitOfWork.MonetaryFunds.GetAllAsync();
                var fundDtos = _mapper.Map<IEnumerable<MonetaryFundDto>>(funds);
                return Result<IEnumerable<MonetaryFundDto>>.Success(fundDtos);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<MonetaryFundDto>>.Failure($"Error al obtener los fondos monetarios: {ex.Message}");
            }
        }

        public async Task<Result<MonetaryFundDto>> GetByIdAsync(int id)
        {
            try
            {
                var fund = await _unitOfWork.MonetaryFunds.GetByIdAsync(id);
                if (fund == null)
                    return Result<MonetaryFundDto>.Failure("Fondo monetario no encontrado");

                var fundDto = _mapper.Map<MonetaryFundDto>(fund);
                return Result<MonetaryFundDto>.Success(fundDto);
            }
            catch (Exception ex)
            {
                return Result<MonetaryFundDto>.Failure($"Error al obtener el fondo monetario: {ex.Message}");
            }
        }

        public async Task<Result<MonetaryFundDto>> CreateAsync(CreateMonetaryFundDto createDto)
        {
            try
            {
                // Antes de crear el fondo, verificar que el usuario existe
                var user = await _unitOfWork.Users.GetByIdAsync(createDto.UserId);
                if (user == null)
                    return Result<MonetaryFundDto>.Failure("El usuario especificado no existe");

                // Verificar si ya existe un fondo con el mismo nombre
                var existingFunds = await _unitOfWork.MonetaryFunds.GetAllAsync();
                if (existingFunds.Any(f => f.Name.ToLower() == createDto.Name.ToLower()))
                    return Result<MonetaryFundDto>.Failure("Ya existe un fondo monetario con ese nombre");

                var fund = _mapper.Map<MonetaryFund>(createDto);
                fund.UserId = createDto.UserId;
                fund.CreatedAt = DateTime.UtcNow;
                fund.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.MonetaryFunds.AddAsync(fund);
                await _unitOfWork.CompleteAsync();

                var fundDto = _mapper.Map<MonetaryFundDto>(fund);
                return Result<MonetaryFundDto>.Success(fundDto);
            }
            catch (Exception ex)
            {
                return Result<MonetaryFundDto>.Failure($"Error al crear el fondo monetario: {ex.Message}");
            }
        }

        public async Task<Result<MonetaryFundDto>> UpdateAsync(int id, UpdateMonetaryFundDto updateDto)
        {
            try
            {
                var fund = await _unitOfWork.MonetaryFunds.GetByIdAsync(id);
                if (fund == null)
                    return Result<MonetaryFundDto>.Failure("Fondo monetario no encontrado");

                // Verificar si ya existe otro fondo con el mismo nombre
                var existingFunds = await _unitOfWork.MonetaryFunds.GetAllAsync();
                if (existingFunds.Any(f => f.Id != id && f.Name.ToLower() == updateDto.Name.ToLower()))
                    return Result<MonetaryFundDto>.Failure("Ya existe otro fondo monetario con ese nombre");

                _mapper.Map(updateDto, fund);
                fund.UpdatedAt = DateTime.UtcNow;

                _unitOfWork.MonetaryFunds.Update(fund);
                await _unitOfWork.CompleteAsync();

                var fundDto = _mapper.Map<MonetaryFundDto>(fund);
                return Result<MonetaryFundDto>.Success(fundDto);
            }
            catch (Exception ex)
            {
                return Result<MonetaryFundDto>.Failure($"Error al actualizar el fondo monetario: {ex.Message}");
            }
        }

        public async Task<Result<bool>> DeleteAsync(int id)
        {
            try
            {
                var fund = await _unitOfWork.MonetaryFunds.GetByIdAsync(id);
                if (fund == null)
                    return Result<bool>.Failure("Fondo monetario no encontrado");

                // Verificar si el fondo tiene movimientos asociados
                var hasRecords = await _unitOfWork.ExpenseRecords.HasExpenseRecordsForFundAsync(id);
                var hasDeposits = await _unitOfWork.Deposits.HasDepositsForFundAsync(id);

                if (hasRecords || hasDeposits)
                    return Result<bool>.Failure("No se puede eliminar el fondo monetario porque tiene movimientos asociados");

                _unitOfWork.MonetaryFunds.Delete(fund);
                await _unitOfWork.CompleteAsync();

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure($"Error al eliminar el fondo monetario: {ex.Message}");
            }
        }

        public async Task<Result<decimal>> GetBalanceAsync(int id)
        {
            try
            {
                var fund = await _unitOfWork.MonetaryFunds.GetByIdAsync(id);
                if (fund == null)
                    return Result<decimal>.Failure("Fondo monetario no encontrado");

                var deposits = await _unitOfWork.Deposits.GetByMonetaryFundIdAsync(id);
                var expenses = await _unitOfWork.ExpenseRecords.GetByMonetaryFundIdAsync(id);

                var totalDeposits = deposits.Sum(d => d.Amount);
                var totalExpenses = expenses.Sum(e => e.Amount);
                var balance = totalDeposits - totalExpenses;

                return Result<decimal>.Success(balance);
            }
            catch (Exception ex)
            {
                return Result<decimal>.Failure($"Error al calcular el balance: {ex.Message}");
            }
        }
    }
}
