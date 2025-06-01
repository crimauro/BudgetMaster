using AutoMapper;
using BudgetMaster.Application.DTOs.Auth;
using BudgetMaster.Application.DTOs.Budgets;
using BudgetMaster.Application.DTOs.Deposits;
using BudgetMaster.Application.DTOs.ExpenseRecords;
using BudgetMaster.Application.DTOs.ExpenseTypes;
using BudgetMaster.Application.DTOs.MonetaryFunds;
using BudgetMaster.Application.DTOs.Reports;
using BudgetMaster.Domain.Entities;

namespace BudgetMaster.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {            // User mappings
            CreateMap<User, UserDto>();
            CreateMap<User, LoginResponseDto>()
                .ForMember(dest => dest.IsSuccess, opt => opt.Ignore())
                .ForMember(dest => dest.Message, opt => opt.Ignore())
                .ForMember(dest => dest.Token, opt => opt.Ignore());

            // ExpenseType mappings
            CreateMap<ExpenseType, ExpenseTypeDto>();
            CreateMap<CreateExpenseTypeDto, ExpenseType>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Code, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedDate, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore())
                .ForMember(dest => dest.Budgets, opt => opt.Ignore())
                .ForMember(dest => dest.ExpenseDetails, opt => opt.Ignore());

            // MonetaryFund mappings
            CreateMap<MonetaryFund, MonetaryFundDto>();
            CreateMap<CreateMonetaryFundDto, MonetaryFund>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedDate, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore())
                .ForMember(dest => dest.ExpenseRecords, opt => opt.Ignore())
                .ForMember(dest => dest.Deposits, opt => opt.Ignore());
                

            // Agregar el mapeo para UpdateMonetaryFundDto
            CreateMap<UpdateMonetaryFundDto, MonetaryFund>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedDate, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.InitialBalance, opt => opt.Ignore())
                .ForMember(dest => dest.ExpenseRecords, opt => opt.Ignore())
                .ForMember(dest => dest.Deposits, opt => opt.Ignore());

            // Budget mappings
            CreateMap<Budget, BudgetDto>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.Username))
                .ForMember(dest => dest.ExpenseTypeName, opt => opt.MapFrom(src => src.ExpenseType.Name))
                .ForMember(dest => dest.ExpenseTypeCode, opt => opt.MapFrom(src => src.ExpenseType.Code))
                .ForMember(dest => dest.SpentAmount, opt => opt.Ignore())
                .ForMember(dest => dest.RemainingAmount, opt => opt.Ignore());            CreateMap<CreateBudgetDto, Budget>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedDate, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.ExpenseType, opt => opt.Ignore());

            // Agregar el mapeo para UpdateBudgetDto
            CreateMap<UpdateBudgetDto, Budget>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedDate, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.ExpenseType, opt => opt.Ignore());

            // ExpenseRecord mappings
            CreateMap<ExpenseRecord, ExpenseRecordDto>()
                .ForMember(dest => dest.MonetaryFundName, opt => opt.MapFrom(src => src.MonetaryFund.Name))
                .ForMember(dest => dest.DocumentTypeName, opt => opt.MapFrom(src => src.DocumentType.ToString()));

            CreateMap<CreateExpenseRecordDto, ExpenseRecord>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.TotalAmount, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedDate, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore())
                .ForMember(dest => dest.MonetaryFund, opt => opt.Ignore())
                .ForMember(dest => dest.ExpenseDetails, opt => opt.Ignore());

            // ExpenseDetail mappings
            CreateMap<ExpenseDetail, ExpenseDetailDto>()
                .ForMember(dest => dest.ExpenseTypeName, opt => opt.MapFrom(src => src.ExpenseType.Name))
                .ForMember(dest => dest.ExpenseTypeCode, opt => opt.MapFrom(src => src.ExpenseType.Code));

            CreateMap<CreateExpenseDetailDto, ExpenseDetail>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.ExpenseRecordId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedDate, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore())
                .ForMember(dest => dest.ExpenseRecord, opt => opt.Ignore())
                .ForMember(dest => dest.ExpenseType, opt => opt.Ignore());

            // Deposit mappings
            CreateMap<Deposit, DepositDto>()
                .ForMember(dest => dest.MonetaryFundName, opt => opt.MapFrom(src => src.MonetaryFund.Name));

            CreateMap<CreateDepositDto, Deposit>()
                 .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedDate, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore())
                .ForMember(dest => dest.MonetaryFund, opt => opt.Ignore());

            CreateMap<UpdateDepositDto, Deposit>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedDate, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore())
                .ForMember(dest => dest.MonetaryFund, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore());

            CreateMap<UpdateExpenseRecordDto, ExpenseRecord>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.ModifiedDate, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore())
                .ForMember(dest => dest.MonetaryFund, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.ExpenseDetails, opt => opt.Ignore());
        }
    }
}
