namespace RCM.API.Featuers.RequestForJobPost
{
    public class JobRequestEntity
    {
        public Guid Id { get; set; }
        public string RequesterId { get; set; } // Get from auth service
        public string RequesterOrg { get; set; }
        public string RequestedPosition { get; set; }

        public string ChangedById { get; set; }
        public DateTime ChangedAt { get; set; }

        public bool IsActive { get; set; } = true; // instead of delete set to inactive
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
