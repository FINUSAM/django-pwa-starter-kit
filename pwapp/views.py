from django.shortcuts import render

# Create your views here.
def home(request):
    return render(request, 'home.html')

def fallback(request):
    return render(request, 'fallback.html')

def test(request):
    return render(request, 'test.html')