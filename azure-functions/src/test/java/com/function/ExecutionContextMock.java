package com.function;

import com.microsoft.azure.functions.ExecutionContext;
import java.util.logging.Logger;
//import org.apache.logging.log4j.Logger;


public class ExecutionContextMock implements ExecutionContext {

    @Override
    public Logger getLogger() {
        //(org.apache.logging.log4j.Logger)
        return null;
    }

    @Override
    public String getInvocationId() {
        return null;
    }

    @Override
    public String getFunctionName() {
        return null;
    }
}
