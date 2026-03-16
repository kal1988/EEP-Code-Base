using AutoMapper;
using RCM.API.Featuers.RequestForJobPost;
using RCM.API.Featuers.RequestForJobPost.CreateRequestForJobPost;

namespace RCM.API.Mapping
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            CreateMap<CreateRequestForJobPostCommand, JobRequestEntity>()
                .ForMember(d => d.PositionId, o => o.Ignore())
                .ForMember(d => d.VacantPositionCount, o => o.MapFrom(s => 1))
                .ForMember(d => d.Id, o => o.Ignore());
                
        }
    }
}
