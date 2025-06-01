using AutoMapper;
using BudgetMaster.Application.DTOs.Auth;
using BudgetMaster.Domain.Common;
using BudgetMaster.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace BudgetMaster.Application.Services
{    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;

        public AuthService(IUnitOfWork unitOfWork, IMapper mapper, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _configuration = configuration;
        }public async Task<Result<LoginResponseDto>> LoginAsync(LoginRequestDto loginRequest)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByUsernameAsync(loginRequest.Username);

                if (user == null || !BCrypt.Net.BCrypt.Verify(loginRequest.Password, user.PasswordHash))
                {
                    return Result<LoginResponseDto>.Failure("Usuario o contraseña incorrectos");
                }

                var response = new LoginResponseDto
                {
                    IsSuccess = true,
                    Message = "Login exitoso",
                    Token = GenerateToken(user.Username),
                    Username = user.Username,
                    Email = user.Email,
                    FullName = user.FullName
                };                return Result<LoginResponseDto>.Success(response);
            }
            catch (Exception ex)
            {
                return Result<LoginResponseDto>.Failure($"Error en el login: {ex.Message}");
            }
        }

        public async Task<Result<UserDto>> RegisterAsync(RegisterDto registerDto)
        {
            try
            {
                // Verificar si el usuario ya existe
                var existingUser = await _unitOfWork.Users.GetByUsernameAsync(registerDto.Username);
                if (existingUser != null)
                {
                    return Result<UserDto>.Failure("El nombre de usuario ya existe");
                }

                // Verificar si el email ya existe
                var existingEmail = await _unitOfWork.Users.GetByEmailAsync(registerDto.Email);
                if (existingEmail != null)
                {
                    return Result<UserDto>.Failure("El email ya está registrado");
                }

                // Crear nuevo usuario
                var hashedPassword = await HashPasswordAsync(registerDto.Password);
                var user = new BudgetMaster.Domain.Entities.User
                {
                    Username = registerDto.Username,
                    Email = registerDto.Email,
                    FirstName = registerDto.FirstName,
                    LastName = registerDto.LastName,
                    DocumentType = registerDto.DocumentType,
                    DocumentNumber = registerDto.DocumentNumber,
                    PasswordHash = hashedPassword,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                await _unitOfWork.Users.AddAsync(user);
                await _unitOfWork.CompleteAsync();

                var userDto = _mapper.Map<UserDto>(user);
                return Result<UserDto>.Success(userDto);
            }
            catch (Exception ex)
            {
                return Result<UserDto>.Failure($"Error en el registro: {ex.Message}");
            }
        }

        public async Task<string> HashPasswordAsync(string password)
        {
            return await Task.Run(() =>
            {
                using var sha256 = SHA256.Create();
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            });
        }

        public async Task<bool> VerifyPasswordAsync(string password, string hash)
        {
            var hashedPassword = await HashPasswordAsync(password);
            return hashedPassword == hash;
        }        private string GenerateToken(string username)
        {
            // Obtener configuración JWT
            var jwtKey = _configuration["Jwt:Key"] ?? "DefaultSecretKeyForDevelopment";
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? "BudgetMaster";
            var jwtAudience = _configuration["Jwt:Audience"] ?? "BudgetMasterClient";
            
            // Clave secreta para firmar el token JWT
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
              // Crear los claims (información de identidad)
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, 
                    new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString(), 
                    ClaimValueTypes.Integer64),
                new Claim("Username", username)
            };
            
            // Crear el token JWT
            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24), // Token válido por 24 horas
                signingCredentials: creds
            );
            
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
