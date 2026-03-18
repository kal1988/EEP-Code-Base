using AutoMapper;
using RCM.API.Featuers.RequestForJobPost;
using RCM.API.Featuers.RequestForJobPost.CreateRequestForJobPost;

namespace RCM.API.Mapping
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            CreateMap<CreateRequestForJobPostCommand, JobRequestEntity>();
                
        }
    }
}
