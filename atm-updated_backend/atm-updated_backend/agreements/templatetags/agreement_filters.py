from django import template

register = template.Library()

@register.filter
def get_choice_display(value, choices):
    """
    Get the display value for a choice field value
    """
    if not choices or not value:
        return value
    
    # Convert choices to dict if it's a list of tuples
    if isinstance(choices, (list, tuple)):
        choices = dict(choices)
    
    return choices.get(value, value) 