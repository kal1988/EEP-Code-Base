using MediatR;

namespace BuildingBlocks.CQRS
{
    public interface IQuery<out TResult> : IRequest<TResult>
    {

    }
}
