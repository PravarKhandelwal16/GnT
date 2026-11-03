package com.gnt.backend.config;

import io.imagekit.sdk.ImageKit;
import io.imagekit.sdk.config.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;

@org.springframework.context.annotation.Configuration
@ConditionalOnExpression("!'${imagekit.private-key:}'.isBlank()")
public class ImageKitConfig {

    @Value("${imagekit.public-key}")
    private String publicKey;

    @Value("${imagekit.private-key}")
    private String privateKey;

    @Value("${imagekit.url-endpoint}")
    private String urlEndpoint;

    @Bean
    public ImageKit imageKit() {
        ImageKit imageKit = ImageKit.getInstance();
        imageKit.setConfig(new Configuration(publicKey, privateKey, urlEndpoint));
        return imageKit;
    }
}
