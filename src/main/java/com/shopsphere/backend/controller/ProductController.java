package com.shopsphere.backend.controller;

import com.shopsphere.backend.entity.Product;
import com.shopsphere.backend.service.ProductService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }
    @PostMapping("/products")
public Product createProduct(@RequestBody Product product) {
    return productService.saveProduct(product);
}
    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }
}