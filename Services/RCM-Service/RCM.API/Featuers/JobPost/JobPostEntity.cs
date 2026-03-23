namespace RCM.API.Featuers.JobPost
{
    public class JobPostEntity
    {
        public Guid Id { get; set; }
        public string Positions { get; set; }

        public bool IsActive { get; set; }
        public DateTime PostingDate { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
