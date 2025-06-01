using AutoMapper;
using BudgetMaster.Application.DTOs.ExpenseRecords;
using BudgetMaster.Domain.Entities;
using BudgetMaster.Domain.Interfaces;
using BudgetMaster.Domain.Common;

namespace BudgetMaster.Application.Services
{
    public class ExpenseRecordService : IExpenseRecordService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ExpenseRecordService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<IEnumerable<ExpenseRecordDto>>> GetAllAsync()
        {
            try
            {
                var records = await _unitOfWork.ExpenseRecords.GetAllAsync();
                var recordDtos = _mapper.Map<IEnumerable<ExpenseRecordDto>>(records);
                return Result<IEnumerable<ExpenseRecordDto>>.Success(recordDtos);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<ExpenseRecordDto>>.Failure($"Error al obtener los registros de gastos: {ex.Message}");
            }
        }

        public async Task<Result<ExpenseRecordDto>> GetByIdAsync(int id)
        {
            try
            {
                var record = await _unitOfWork.ExpenseRecords.GetByIdAsync(id);
                if (record == null)
                    return Result<ExpenseRecordDto>.Failure("Registro de gasto no encontrado");

                var recordDto = _mapper.Map<ExpenseRecordDto>(record);
                return Result<ExpenseRecordDto>.Success(recordDto);
            }
            catch (Exception ex)
            {
                return Result<ExpenseRecordDto>.Failure($"Error al obtener el registro de gasto: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<ExpenseRecordDto>>> GetByExpenseTypeIdAsync(int expenseTypeId)
        {
            try
            {
                var records = await _unitOfWork.ExpenseRecords.GetByExpenseTypeIdAsync(expenseTypeId);
                var recordDtos = _mapper.Map<IEnumerable<ExpenseRecordDto>>(records);
                return Result<IEnumerable<ExpenseRecordDto>>.Success(recordDtos);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<ExpenseRecordDto>>.Failure($"Error al obtener los registros por tipo de gasto: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<ExpenseRecordDto>>> GetByMonetaryFundIdAsync(int monetaryFundId)
        {
            try
            {
                var records = await _unitOfWork.ExpenseRecords.GetByMonetaryFundIdAsync(monetaryFundId);
                var recordDtos = _mapper.Map<IEnumerable<ExpenseRecordDto>>(records);
                return Result<IEnumerable<ExpenseRecordDto>>.Success(recordDtos);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<ExpenseRecordDto>>.Failure($"Error al obtener los registros por fondo monetario: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<ExpenseRecordDto>>> GetByPeriodAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                var records = await _unitOfWork.ExpenseRecords.GetByPeriodAsync(startDate, endDate);
                var recordDtos = _mapper.Map<IEnumerable<ExpenseRecordDto>>(records);
                return Result<IEnumerable<ExpenseRecordDto>>.Success(recordDtos);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<ExpenseRecordDto>>.Failure($"Error al obtener los registros por período: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<ExpenseRecordDto>>> GetByExpenseTypeAndPeriodAsync(int expenseTypeId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var records = await _unitOfWork.ExpenseRecords.GetByExpenseTypeAndPeriodAsync(expenseTypeId, startDate, endDate);
                var recordDtos = _mapper.Map<IEnumerable<ExpenseRecordDto>>(records);
                return Result<IEnumerable<ExpenseRecordDto>>.Success(recordDtos);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<ExpenseRecordDto>>.Failure($"Error al obtener los registros por tipo y período: {ex.Message}");
            }
        }

        public async Task<Result<ExpenseRecordDto>> CreateAsync(CreateExpenseRecordDto createDto)
        {
            try
            {
                // Verificar que el usuario existe
                var user = await _unitOfWork.Users.GetByIdAsync(createDto.UserId);
                if (user == null)
                    return Result<ExpenseRecordDto>.Failure($"El usuario con ID {createDto.UserId} no existe");

                // Verificar que el tipo de gasto existe
                var expenseType = await _unitOfWork.ExpenseTypes.GetByIdAsync(createDto.ExpenseTypeId);
                if (expenseType == null)
                    return Result<ExpenseRecordDto>.Failure("El tipo de gasto especificado no existe");

                // Verificar que el fondo monetario existe
                var monetaryFund = await _unitOfWork.MonetaryFunds.GetByIdAsync(createDto.MonetaryFundId);
                if (monetaryFund == null)
                    return Result<ExpenseRecordDto>.Failure("El fondo monetario especificado no existe");

                // Verificar que hay suficiente saldo en el fondo
                var deposits = await _unitOfWork.Deposits.GetByMonetaryFundIdAsync(createDto.MonetaryFundId);
                var expenses = await _unitOfWork.ExpenseRecords.GetByMonetaryFundIdAsync(createDto.MonetaryFundId);
                var totalDeposits = deposits.Sum(d => d.Amount);
                var totalExpenses = expenses.Sum(e => e.Amount);
                var availableBalance = totalDeposits - totalExpenses;

                if (availableBalance < createDto.Amount)
                    return Result<ExpenseRecordDto>.Failure("No hay suficiente saldo en el fondo monetario");

                var record = _mapper.Map<ExpenseRecord>(createDto);
                record.CreatedAt = DateTime.UtcNow;
                record.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.ExpenseRecords.AddAsync(record);
                await _unitOfWork.CompleteAsync();

                // Crear detalles del gasto si se proporcionaron
                if (createDto.ExpenseDetails != null && createDto.ExpenseDetails.Any())
                {
                    foreach (var detailDto in createDto.ExpenseDetails)
                    {
                        var detail = _mapper.Map<ExpenseDetail>(detailDto);
                        detail.ExpenseRecordId = record.Id;
                        detail.CreatedAt = DateTime.UtcNow;
                        detail.UpdatedAt = DateTime.UtcNow;

                        await _unitOfWork.ExpenseRecords.AddExpenseDetailAsync(detail);
                    }
                    await _unitOfWork.CompleteAsync();
                }

                var recordDto = _mapper.Map<ExpenseRecordDto>(record);
                return Result<ExpenseRecordDto>.Success(recordDto);
            }
            catch (Exception ex)
            {
                return Result<ExpenseRecordDto>.Failure($"Error al crear el registro de gasto: {ex.Message}");
            }
        }

        public async Task<Result<ExpenseRecordDto>> UpdateAsync(int id, UpdateExpenseRecordDto updateDto)
        {
            try
            {
                var record = await _unitOfWork.ExpenseRecords.GetByIdAsync(id);
                if (record == null)
                    return Result<ExpenseRecordDto>.Failure("Registro de gasto no encontrado");

                // Verificar que el tipo de gasto existe
                var expenseType = await _unitOfWork.ExpenseTypes.GetByIdAsync(updateDto.ExpenseTypeId);
                if (expenseType == null)
                    return Result<ExpenseRecordDto>.Failure("El tipo de gasto especificado no existe");

                // Verificar que el fondo monetario existe
                var monetaryFund = await _unitOfWork.MonetaryFunds.GetByIdAsync(updateDto.MonetaryFundId);
                if (monetaryFund == null)
                    return Result<ExpenseRecordDto>.Failure("El fondo monetario especificado no existe");

                // Si cambió el monto o el fondo, verificar saldo disponible
                if (record.Amount != updateDto.Amount || record.MonetaryFundId != updateDto.MonetaryFundId)
                {
                    var deposits = await _unitOfWork.Deposits.GetByMonetaryFundIdAsync(updateDto.MonetaryFundId);
                    var expenses = await _unitOfWork.ExpenseRecords.GetByMonetaryFundIdAsync(updateDto.MonetaryFundId);
                    var totalDeposits = deposits.Sum(d => d.Amount);
                    var totalExpenses = expenses.Where(e => e.Id != id).Sum(e => e.Amount); // Excluir el registro actual
                    var availableBalance = totalDeposits - totalExpenses;

                    if (availableBalance < updateDto.Amount)
                        return Result<ExpenseRecordDto>.Failure("No hay suficiente saldo en el fondo monetario");
                }

                _mapper.Map(updateDto, record);
                record.UpdatedAt = DateTime.UtcNow;

                _unitOfWork.ExpenseRecords.Update(record);
                await _unitOfWork.CompleteAsync();

                var recordDto = _mapper.Map<ExpenseRecordDto>(record);
                return Result<ExpenseRecordDto>.Success(recordDto);
            }
            catch (Exception ex)
            {
                return Result<ExpenseRecordDto>.Failure($"Error al actualizar el registro de gasto: {ex.Message}");
            }
        }

        public async Task<Result<bool>> DeleteAsync(int id)
        {
            try
            {
                var record = await _unitOfWork.ExpenseRecords.GetByIdAsync(id);
                if (record == null)
                    return Result<bool>.Failure("Registro de gasto no encontrado");

                _unitOfWork.ExpenseRecords.Delete(record);
                await _unitOfWork.CompleteAsync();

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure($"Error al eliminar el registro de gasto: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<ExpenseDetailDto>>> GetExpenseDetailsAsync(int expenseRecordId)
        {
            try
            {
                var details = await _unitOfWork.ExpenseRecords.GetExpenseDetailsAsync(expenseRecordId);
                var detailDtos = _mapper.Map<IEnumerable<ExpenseDetailDto>>(details);
                return Result<IEnumerable<ExpenseDetailDto>>.Success(detailDtos);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<ExpenseDetailDto>>.Failure($"Error al obtener los detalles del gasto: {ex.Message}");
            }
        }

        public async Task<Result<ExpenseDetailDto>> AddExpenseDetailAsync(int expenseRecordId, CreateExpenseDetailDto createDto)
        {
            try
            {
                var record = await _unitOfWork.ExpenseRecords.GetByIdAsync(expenseRecordId);
                if (record == null)
                    return Result<ExpenseDetailDto>.Failure("Registro de gasto no encontrado");

                var detail = _mapper.Map<ExpenseDetail>(createDto);
                detail.ExpenseRecordId = expenseRecordId;
                detail.CreatedAt = DateTime.UtcNow;
                detail.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.ExpenseRecords.AddExpenseDetailAsync(detail);
                await _unitOfWork.CompleteAsync();

                var detailDto = _mapper.Map<ExpenseDetailDto>(detail);
                return Result<ExpenseDetailDto>.Success(detailDto);
            }
            catch (Exception ex)
            {
                return Result<ExpenseDetailDto>.Failure($"Error al agregar el detalle del gasto: {ex.Message}");
            }
        }

        public async Task<Result<bool>> RemoveExpenseDetailAsync(int expenseDetailId)
        {
            try
            {
                var detail = await _unitOfWork.ExpenseRecords.GetExpenseDetailByIdAsync(expenseDetailId);
                if (detail == null)
                    return Result<bool>.Failure("Detalle de gasto no encontrado");

                _unitOfWork.ExpenseRecords.DeleteExpenseDetail(detail);
                await _unitOfWork.CompleteAsync();

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure($"Error al eliminar el detalle del gasto: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<ExpenseRecordDto>>> GetByUserIdAsync(int userId)
        {
            try
            {
                var records = await _unitOfWork.ExpenseRecords.GetByUserIdAsync(userId);
                var recordDtos = _mapper.Map<IEnumerable<ExpenseRecordDto>>(records);
                return Result<IEnumerable<ExpenseRecordDto>>.Success(recordDtos);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<ExpenseRecordDto>>.Failure($"Error al obtener los registros de gasto del usuario: {ex.Message}");
            }
        }
    }
}
