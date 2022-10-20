package ui.utils;

import org.aeonbits.owner.Config;

@Config.Sources({
        "classpath:${env}.properties"
})
public interface Environment extends Config {
    String browser();
    String url();
    String username();
    String password();
    String subaccountAdminUser();
    String subaccountAdminPassword();
    String stakeholderUser();
    String stakeholderPassword();
    boolean activeDirectory();

    @Key("db.port")
    int getDBPort();
}