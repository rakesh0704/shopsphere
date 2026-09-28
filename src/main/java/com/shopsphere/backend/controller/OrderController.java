package com.shopsphere.backend.controller;

import com.shopsphere.backend.model.Order;
import com.shopsphere.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @PostMapping("/orders")
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        if (order.getStatus() == null || order.getStatus().trim().isEmpty()) {
            order.setStatus("PENDING");
        }

        Order savedOrder = orderRepository.save(order);
        return ResponseEntity.ok(savedOrder);
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id,
                                                  @RequestBody Map<String, String> payload) {
        String status = payload.get("status");

        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Optional<Order> optionalOrder = orderRepository.findById(id);

        if (optionalOrder.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Order order = optionalOrder.get();
        order.setStatus(status);

        Order updatedOrder = orderRepository.save(order);
        return ResponseEntity.ok(updatedOrder);
    }
}