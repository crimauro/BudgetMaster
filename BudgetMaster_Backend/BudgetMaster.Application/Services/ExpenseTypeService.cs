using AutoMapper;
using BudgetMaster.Application.DTOs.ExpenseTypes;
using BudgetMaster.Domain.Common;
using BudgetMaster.Domain.Entities;
using BudgetMaster.Domain.Interfaces;

namespace BudgetMaster.Application.Services
{
    public class ExpenseTypeService : IExpenseTypeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ExpenseTypeService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<IEnumerable<ExpenseTypeDto>>> GetAllAsync()
        {
            try
            {
                var expenseTypes = await _unitOfWork.ExpenseTypes.GetAllAsync();
                var expenseTypeDtos = _mapper.Map<IEnumerable<ExpenseTypeDto>>(expenseTypes);
                return Result<IEnumerable<ExpenseTypeDto>>.Success(expenseTypeDtos);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<ExpenseTypeDto>>.Failure($"Error al obtener tipos de gasto: {ex.Message}");
            }
        }

        public async Task<Result<ExpenseTypeDto>> GetByIdAsync(int id)
        {
            try
            {
                var expenseType = await _unitOfWork.ExpenseTypes.GetByIdAsync(id);
                if (expenseType == null)
                {
                    return Result<ExpenseTypeDto>.Failure("Tipo de gasto no encontrado");
                }

                var expenseTypeDto = _mapper.Map<ExpenseTypeDto>(expenseType);
                return Result<ExpenseTypeDto>.Success(expenseTypeDto);
            }
            catch (Exception ex)
            {
                return Result<ExpenseTypeDto>.Failure($"Error al obtener tipo de gasto: {ex.Message}");
            }
        }

        public async Task<Result<ExpenseTypeDto>> CreateAsync(CreateExpenseTypeDto createDto)
        {
            try
            {
                var nextCode = await _unitOfWork.ExpenseTypes.GetNextCodeAsync();
                
                var expenseType = new ExpenseType
                {
                    Code = nextCode,
                    Name = createDto.Name,
                    Description = createDto.Description,
                    CreatedDate = DateTime.UtcNow,
                    IsActive = true
                };

                var createdExpenseType = await _unitOfWork.ExpenseTypes.AddAsync(expenseType);
                await _unitOfWork.SaveChangesAsync();

                var expenseTypeDto = _mapper.Map<ExpenseTypeDto>(createdExpenseType);
                return Result<ExpenseTypeDto>.Success(expenseTypeDto);
            }
            catch (Exception ex)
            {
                return Result<ExpenseTypeDto>.Failure($"Error al crear tipo de gasto: {ex.Message}");
            }
        }

        public async Task<Result<ExpenseTypeDto>> UpdateAsync(UpdateExpenseTypeDto updateDto)
        {
            try
            {
                var expenseType = await _unitOfWork.ExpenseTypes.GetByIdAsync(updateDto.Id);
                if (expenseType == null)
                {
                    return Result<ExpenseTypeDto>.Failure("Tipo de gasto no encontrado");
                }

                expenseType.Code = updateDto.Code;
                expenseType.Name = updateDto.Name;
                expenseType.Description = updateDto.Description;
                expenseType.ModifiedDate = DateTime.UtcNow;

                await _unitOfWork.ExpenseTypes.UpdateAsync(expenseType);
                await _unitOfWork.SaveChangesAsync();

                var expenseTypeDto = _mapper.Map<ExpenseTypeDto>(expenseType);
                return Result<ExpenseTypeDto>.Success(expenseTypeDto);
            }
            catch (Exception ex)
            {
                return Result<ExpenseTypeDto>.Failure($"Error al actualizar tipo de gasto: {ex.Message}");
            }
        }

        public async Task<Result> DeleteAsync(int id)
        {
            try
            {
                var expenseType = await _unitOfWork.ExpenseTypes.GetByIdAsync(id);
                if (expenseType == null)
                {
                    return Result.Failure("Tipo de gasto no encontrado");
                }

                expenseType.IsActive = false;
                expenseType.ModifiedDate = DateTime.UtcNow;

                await _unitOfWork.ExpenseTypes.UpdateAsync(expenseType);
                await _unitOfWork.SaveChangesAsync();

                return Result.Success();
            }
            catch (Exception ex)
            {
                return Result.Failure($"Error al eliminar tipo de gasto: {ex.Message}");
            }
        }

        public async Task<Result<string>> GetNextCodeAsync()
        {
            try
            {
                var nextCode = await _unitOfWork.ExpenseTypes.GetNextCodeAsync();
                return Result<string>.Success(nextCode);
            }
            catch (Exception ex)
            {
                return Result<string>.Failure($"Error al obtener siguiente código: {ex.Message}");
            }
        }
    }
}
