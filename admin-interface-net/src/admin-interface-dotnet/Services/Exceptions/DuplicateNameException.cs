using System;

namespace admin_interface_dotnet.Services.Exceptions
{
    public class DuplicateNameException : Exception
    {
        public DuplicateNameException() : base()
        {
        }

        public DuplicateNameException(string message) : base(message)
        {
        }

        public DuplicateNameException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}
