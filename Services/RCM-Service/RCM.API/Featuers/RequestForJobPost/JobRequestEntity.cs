namespace RCM.API.Featuers.RequestForJobPost
{
    public class JobRequestEntity
    {
        public Guid Id { get; set; }
        public string PositionId { get; set; }
        public int VacantPositionCount { get; set; }
    }
}
