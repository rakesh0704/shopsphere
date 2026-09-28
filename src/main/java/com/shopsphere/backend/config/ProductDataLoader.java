package com.shopsphere.backend.config;

import com.shopsphere.backend.dto.DummyProduct;
import com.shopsphere.backend.dto.DummyProductResponse;
import com.shopsphere.backend.entity.Product;
import com.shopsphere.backend.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

@Component
public class ProductDataLoader implements CommandLineRunner {

    private final ProductRepository productRepository;

    public ProductDataLoader(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) throws Exception {

        System.out.println("Product Loader Started");

        if (productRepository.count() > 0) {
            System.out.println("Products already exist. Skipping import.");
            return;
        }

        RestTemplate restTemplate = new RestTemplate();

        String url = "https://dummyjson.com/products?limit=194";

        DummyProductResponse response =
                restTemplate.getForObject(url, DummyProductResponse.class);

        if (response != null && response.getProducts() != null) {

            for (DummyProduct dummy : response.getProducts()) {

                Product product = new Product();

                product.setName(dummy.getTitle());
                product.setDescription(dummy.getDescription());
                product.setPrice(BigDecimal.valueOf(dummy.getPrice()));
                product.setImageUrl(dummy.getThumbnail());
                product.setCategory(dummy.getCategory());
                product.setStock(dummy.getStock());

                productRepository.save(product);
            }

            System.out.println(
                    response.getProducts().size() +
                    " products imported successfully!"
            );
        }
    }
}