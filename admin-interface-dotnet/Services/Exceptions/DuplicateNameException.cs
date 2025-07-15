using System;

namespace admin_interface_dotnet.Services.Exceptions
{
    public class DuplicateNameException : Exception
    {
        public DuplicateNameException(string message) : base(message) { }
    }
}
