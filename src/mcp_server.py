from mcp.server.fastmcp import FastMCP

# Initialize FastMCP Server named "ProductMetricsServer"
mcp = FastMCP("ProductMetricsServer")

@mcp.tool()
def calculate_product_margin(revenue: float, cost: float) -> float:
    """Calculates the gross profit margin percentage based on revenue and cost."""
    if revenue <= 0:
        return 0.0
    margin = ((revenue - cost) / revenue) * 100
    return round(margin, 2)

@mcp.tool()
def generate_product_sku(category: str, name: str) -> str:
    """Generates a standardized product SKU based on product category and name."""
    cat_code = category[:3].upper()
    name_code = "".join([w[0] for w in name.split()]).upper()[:3]
    import random
    rand_num = random.randint(100, 999)
    return f"{cat_code}-{name_code}-{rand_num}"

if __name__ == "__main__":
    mcp.run()
