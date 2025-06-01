using BudgetMaster.Application.DTOs.Auth;
using BudgetMaster.Domain.Common;

namespace BudgetMaster.Application.Services
{    public interface IAuthService
    {
        Task<Result<LoginResponseDto>> LoginAsync(LoginRequestDto loginRequest);
        Task<Result<UserDto>> RegisterAsync(RegisterDto registerDto);
        Task<string> HashPasswordAsync(string password);
        Task<bool> VerifyPasswordAsync(string password, string hash);
    }
}
