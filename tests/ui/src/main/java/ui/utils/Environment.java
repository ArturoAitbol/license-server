package ui.utils;

import org.aeonbits.owner.Config;

@Config.Sources({
        "classpath:${env}.properties"
})
public interface Environment extends Config {
    String username();
    String password();
    String subaccountAdminUser();
    String subaccountAdminPassword();
    String stakeholderUser();
    String stakeholderPassword();
    String browser();
    String url();
    @Key("db.port")
    int getDBPort();
}