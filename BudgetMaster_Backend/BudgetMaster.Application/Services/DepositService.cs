using AutoMapper;
using BudgetMaster.Application.DTOs.Deposits;
using BudgetMaster.Domain.Entities;
using BudgetMaster.Domain.Interfaces;
using BudgetMaster.Domain.Common;

namespace BudgetMaster.Application.Services
{
    public class DepositService : IDepositService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public DepositService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<IEnumerable<DepositDto>>> GetAllAsync()
        {
            try
            {
                var deposits = await _unitOfWork.Deposits.GetAllAsync();
                var depositDtos = _mapper.Map<IEnumerable<DepositDto>>(deposits);
                return Result<IEnumerable<DepositDto>>.Success(depositDtos);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<DepositDto>>.Failure($"Error al obtener los depósitos: {ex.Message}");
            }
        }

        public async Task<Result<DepositDto>> GetByIdAsync(int id)
        {
            try
            {
                var deposit = await _unitOfWork.Deposits.GetByIdAsync(id);
                if (deposit == null)
                    return Result<DepositDto>.Failure("Depósito no encontrado");

                var depositDto = _mapper.Map<DepositDto>(deposit);
                return Result<DepositDto>.Success(depositDto);
            }
            catch (Exception ex)
            {
                return Result<DepositDto>.Failure($"Error al obtener el depósito: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<DepositDto>>> GetByMonetaryFundIdAsync(int monetaryFundId)
        {
            try
            {
                var deposits = await _unitOfWork.Deposits.GetByMonetaryFundIdAsync(monetaryFundId);
                var depositDtos = _mapper.Map<IEnumerable<DepositDto>>(deposits);
                return Result<IEnumerable<DepositDto>>.Success(depositDtos);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<DepositDto>>.Failure($"Error al obtener los depósitos por fondo monetario: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<DepositDto>>> GetByPeriodAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                var deposits = await _unitOfWork.Deposits.GetByPeriodAsync(startDate, endDate);
                var depositDtos = _mapper.Map<IEnumerable<DepositDto>>(deposits);
                return Result<IEnumerable<DepositDto>>.Success(depositDtos);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<DepositDto>>.Failure($"Error al obtener los depósitos por período: {ex.Message}");
            }
        }

        public async Task<Result<DepositDto>> CreateAsync(CreateDepositDto createDto)
        {
            try
            {
                // Verificar que el usuario existe
                var user = await _unitOfWork.Users.GetByIdAsync(createDto.UserId);
                if (user == null)
                    return Result<DepositDto>.Failure($"El usuario con ID {createDto.UserId} no existe");

                // Verificar que el fondo monetario existe
                var fund = await _unitOfWork.MonetaryFunds.GetByIdAsync(createDto.MonetaryFundId);
                if (fund == null)
                    return Result<DepositDto>.Failure($"El fondo monetario con ID {createDto.MonetaryFundId} no existe");

                var deposit = _mapper.Map<Deposit>(createDto);

                // Asegurar que UserId se asigne correctamente
                deposit.UserId = createDto.UserId;

                deposit.CreatedDate = DateTime.UtcNow;
                deposit.ModifiedDate = DateTime.UtcNow;

                await _unitOfWork.Deposits.AddAsync(deposit);
                await _unitOfWork.CompleteAsync();

                var depositDto = _mapper.Map<DepositDto>(deposit);
                return Result<DepositDto>.Success(depositDto);
            }
            catch (Exception ex)
            {
                var innerMessage = ex.InnerException != null ? ex.InnerException.Message : "No hay detalles adicionales";
                return Result<DepositDto>.Failure($"Error al crear el depósito: {ex.Message}. Detalles: {innerMessage}");
            }
        }

        public async Task<Result<DepositDto>> UpdateAsync(int id, UpdateDepositDto updateDto)
        {
            try
            {
                var deposit = await _unitOfWork.Deposits.GetByIdAsync(id);
                if (deposit == null)
                    return Result<DepositDto>.Failure("Depósito no encontrado");

                // Verificar que el fondo monetario existe
                var monetaryFund = await _unitOfWork.MonetaryFunds.GetByIdAsync(updateDto.MonetaryFundId);
                if (monetaryFund == null)
                    return Result<DepositDto>.Failure("El fondo monetario especificado no existe");

                // Validar que el monto sea positivo
                if (updateDto.Amount <= 0)
                    return Result<DepositDto>.Failure("El monto del depósito debe ser mayor a cero");

                _mapper.Map(updateDto, deposit);
                deposit.UpdatedAt = DateTime.UtcNow;

                _unitOfWork.Deposits.Update(deposit);
                await _unitOfWork.CompleteAsync();

                var depositDto = _mapper.Map<DepositDto>(deposit);
                return Result<DepositDto>.Success(depositDto);
            }
            catch (Exception ex)
            {
                return Result<DepositDto>.Failure($"Error al actualizar el depósito: {ex.Message}");
            }
        }

        public async Task<Result<bool>> DeleteAsync(int id)
        {
            try
            {
                var deposit = await _unitOfWork.Deposits.GetByIdAsync(id);
                if (deposit == null)
                    return Result<bool>.Failure("Depósito no encontrado");

                // Verificar que no afecte el balance del fondo (que no haya gastos que excedan el nuevo balance)
                var monetaryFundId = deposit.MonetaryFundId;
                var deposits = await _unitOfWork.Deposits.GetByMonetaryFundIdAsync(monetaryFundId);
                var expenses = await _unitOfWork.ExpenseRecords.GetByMonetaryFundIdAsync(monetaryFundId);

                var totalDepositsAfterDelete = deposits.Where(d => d.Id != id).Sum(d => d.Amount);
                var totalExpenses = expenses.Sum(e => e.Amount);

                if (totalDepositsAfterDelete < totalExpenses)
                    return Result<bool>.Failure("No se puede eliminar el depósito porque dejaría el fondo con saldo insuficiente para los gastos registrados");

                _unitOfWork.Deposits.Delete(deposit);
                await _unitOfWork.CompleteAsync();

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure($"Error al eliminar el depósito: {ex.Message}");
            }
        }

        public async Task<Result<decimal>> GetTotalAmountByMonetaryFundAsync(int monetaryFundId)
        {
            try
            {
                var deposits = await _unitOfWork.Deposits.GetByMonetaryFundIdAsync(monetaryFundId);
                var totalAmount = deposits.Sum(d => d.Amount);
                return Result<decimal>.Success(totalAmount);
            }
            catch (Exception ex)
            {
                return Result<decimal>.Failure($"Error al calcular el total de depósitos: {ex.Message}");
            }
        }

        public async Task<Result<decimal>> GetTotalAmountByPeriodAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                var deposits = await _unitOfWork.Deposits.GetByPeriodAsync(startDate, endDate);
                var totalAmount = deposits.Sum(d => d.Amount);
                return Result<decimal>.Success(totalAmount);
            }
            catch (Exception ex)
            {
                return Result<decimal>.Failure($"Error al calcular el total de depósitos por período: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<DepositDto>>> GetByMonetaryFundAndPeriodAsync(int monetaryFundId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var deposits = await _unitOfWork.Deposits.GetByMonetaryFundAndPeriodAsync(monetaryFundId, startDate, endDate);
                var depositDtos = _mapper.Map<IEnumerable<DepositDto>>(deposits);
                return Result<IEnumerable<DepositDto>>.Success(depositDtos);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<DepositDto>>.Failure($"Error al obtener los depósitos por fondo y período: {ex.Message}");
            }
        }
    }
}
