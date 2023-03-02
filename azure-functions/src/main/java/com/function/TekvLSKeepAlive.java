package com.function;

import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.TimerTrigger;

public class TekvLSKeepAlive {
    /**
     * This function is triggered automatically each 10 minutes to 
     * avoid cold starts in our http requests 
     * @param timerInfo
     * @param context
     */
    @FunctionName("keepAlive")
    public void keepAlive(
            @TimerTrigger(name = "keepAliveTrigger", schedule = "0 */10 * * * *") String timerInfo,
            final ExecutionContext context) {
        context.getLogger().info("======================================");
        context.getLogger().info("Timer is triggered: " + timerInfo);
        context.getLogger().info("======================================");
    }
}