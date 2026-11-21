using Innovatech.Application.Interfaces;
using Innovatech.Infrastructure.Persistence;

namespace Innovatech.Infrastructure.Repositories;

public class UnitOfWork(AppDbContext context) : IUnitOfWork
{
    public Task<int> SaveChangesAsync(CancellationToken ct = default)
        => context.SaveChangesAsync(ct);
}
