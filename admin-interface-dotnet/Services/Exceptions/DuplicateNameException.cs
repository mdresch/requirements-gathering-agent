using System;

namespace AdminInterface.Services.Exceptions
{
    public class DuplicateNameException : Exception
    {
        public DuplicateNameException(string message) : base(message) { }
    }
}