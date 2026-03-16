using MediatR;

namespace BuildingBlocks.CQRS
{
    public interface ICommand : IRequest<Unit> { } // No Return
    public interface ICommand<out TResult> : IRequest<TResult>
    {
    }
}
